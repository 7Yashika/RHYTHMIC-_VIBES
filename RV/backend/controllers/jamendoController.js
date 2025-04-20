
const Song = require('../models/Song');
const jamendoService = require('../services/jamendoService');

/**
 * Advanced search for songs (local and Jamendo)
 */
exports.searchSongs = async (req, res) => {
  try {
    const { q, name, artist, album, type = 'all', limit = 20 } = req.query;
    
    let localResults = [];
    let jamendoResults = [];
    
    // Search local database
    if (type === 'local' || type === 'all') {
      let query = {};
      
      // Build MongoDB query based on provided parameters
      if (q) {
        // General text search if q is provided
        query = { $text: { $search: q } };
      } else {
        // Otherwise build field-specific query
        const conditions = [];
        
        if (name) conditions.push({ title: { $regex: name, $options: 'i' } });
        if (artist) conditions.push({ artist: { $regex: artist, $options: 'i' } });
        if (album) conditions.push({ album: { $regex: album, $options: 'i' } });
        
        if (conditions.length > 0) {
          query = { $or: conditions };
        }
      }
      
      localResults = await Song.find(query).limit(parseInt(limit)).lean();
    }
    
    // Search Jamendo API
    if (type === 'jamendo' || type === 'all') {
      // Use specific search if name/artist/album are provided, otherwise use general query
      jamendoResults = await jamendoService.searchTracks({
        query: q,
        name: name, 
        artist: artist,
        album: album,
        limit: parseInt(limit)
      });
      
      // Check which Jamendo results are already saved locally
      const externalIds = jamendoResults.map(track => track.externalId);
      const savedSongs = await Song.find({ 
        externalId: { $in: externalIds } 
      }).lean();
      
      // Mark tracks that are already saved
      const savedIdsSet = new Set(savedSongs.map(song => song.externalId));
      jamendoResults = jamendoResults.map(track => ({
        ...track,
        isSaved: savedIdsSet.has(track.externalId)
      }));
    }
    
    res.json({
      local: localResults,
      jamendo: jamendoResults
    });
  } catch (error) {
    console.error('Error searching songs:', error);
    res.status(500).json({ error: 'Failed to search songs' });
  }
};

/**
 * Get tracks by artist name
 */
exports.getTracksByArtist = async (req, res) => {
  try {
    const { artistName } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    
    // First search in local database
    const localSongs = await Song.find({ 
      artist: { $regex: artistName, $options: 'i' } 
    }).limit(limit).lean();
    
    // Then search in Jamendo
    const jamendoTracks = await jamendoService.getTracksByArtist(artistName, limit);
    
    // Check which Jamendo tracks are already saved locally
    const externalIds = jamendoTracks.map(track => track.externalId);
    const savedSongs = await Song.find({ 
      externalId: { $in: externalIds } 
    }).lean();
    
    // Mark tracks that are already saved
    const savedIdsSet = new Set(savedSongs.map(song => song.externalId));
    const markedJamendoTracks = jamendoTracks.map(track => ({
      ...track,
      isSaved: savedIdsSet.has(track.externalId)
    }));
    
    res.json({
      local: localSongs,
      jamendo: markedJamendoTracks
    });
  } catch (error) {
    console.error(`Error fetching tracks for artist ${req.params.artistName}:`, error);
    res.status(500).json({ error: `Failed to fetch tracks for artist ${req.params.artistName}` });
  }
};

/**
 * Get tracks by album name
 */
exports.getTracksByAlbum = async (req, res) => {
  try {
    const { albumName } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    
    // First search in local database
    const localSongs = await Song.find({ 
      album: { $regex: albumName, $options: 'i' } 
    }).limit(limit).lean();
    
    // Then search in Jamendo
    const jamendoTracks = await jamendoService.getTracksByAlbum(albumName, limit);
    
    // Check which Jamendo tracks are already saved locally
    const externalIds = jamendoTracks.map(track => track.externalId);
    const savedSongs = await Song.find({ 
      externalId: { $in: externalIds } 
    }).lean();
    
    // Mark tracks that are already saved
    const savedIdsSet = new Set(savedSongs.map(song => song.externalId));
    const markedJamendoTracks = jamendoTracks.map(track => ({
      ...track,
      isSaved: savedIdsSet.has(track.externalId)
    }));
    
    res.json({
      local: localSongs,
      jamendo: markedJamendoTracks
    });
  } catch (error) {
    console.error(`Error fetching tracks for album ${req.params.albumName}:`, error);
    res.status(500).json({ error: `Failed to fetch tracks for album ${req.params.albumName}` });
  }
};

/**
 * Get popular tracks from Jamendo
 */
exports.getPopularTracks = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const tracks = await jamendoService.getPopularTracks(limit);
    
    // Check which tracks are already saved locally
    const externalIds = tracks.map(track => track.externalId);
    const savedSongs = await Song.find({ 
      externalId: { $in: externalIds } 
    }).lean();
    
    // Mark tracks that are already saved
    const savedIdsSet = new Set(savedSongs.map(song => song.externalId));
    const results = tracks.map(track => ({
      ...track,
      isSaved: savedIdsSet.has(track.externalId)
    }));
    
    res.json(results);
  } catch (error) {
    console.error('Error fetching popular tracks:', error);
    res.status(500).json({ error: 'Failed to fetch popular tracks' });
  }
};

/**
 * Get tracks by genre from Jamendo
 */
exports.getTracksByGenre = async (req, res) => {
  try {
    const { genre } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    
    const tracks = await jamendoService.getTracksByGenre(genre, limit);
    
    // Check which tracks are already saved locally
    const externalIds = tracks.map(track => track.externalId);
    const savedSongs = await Song.find({ 
      externalId: { $in: externalIds } 
    }).lean();
    
    // Mark tracks that are already saved
    const savedIdsSet = new Set(savedSongs.map(song => song.externalId));
    const results = tracks.map(track => ({
      ...track,
      isSaved: savedIdsSet.has(track.externalId)
    }));
    
    res.json(results);
  } catch (error) {
    console.error(`Error fetching ${req.params.genre} tracks:`, error);
    res.status(500).json({ error: `Failed to fetch ${req.params.genre} tracks` });
  }
};

/**
 * Save a Jamendo track to local database
 */
exports.saveSong = async (req, res) => {
  try {
    const trackData = req.body;
    
    // Check if song already exists
    const existingSong = await Song.findOne({ externalId: trackData.externalId });
    if (existingSong) {
      return res.status(200).json({
        message: 'Song already saved',
        song: existingSong
      });
    }
    
    // Create new song
    const newSong = new Song({
      title: trackData.title,
      artist: trackData.artist,
      album: trackData.album,
      genre: trackData.genre,
      url: trackData.url,
      albumArt: trackData.albumArt,
      duration: trackData.duration,
      releaseDate: trackData.releaseDate,
      externalId: trackData.externalId,
      metadata: trackData.metadata || { source: 'jamendo' }
    });
    
    await newSong.save();
    
    res.status(201).json({
      message: 'Song saved successfully',
      song: newSong
    });
  } catch (error) {
    console.error('Error saving Jamendo song:', error);
    res.status(500).json({ error: 'Failed to save song' });
  }
};

/**
 * Get track details from Jamendo by ID
 */
exports.getTrackById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // First check if song exists locally
    const localSong = await Song.findOne({ externalId: id });
    if (localSong) {
      return res.json({
        ...localSong.toObject(),
        isSaved: true
      });
    }
    
    // Get from Jamendo if not found locally
    const track = await jamendoService.getTrackById(id);
    
    res.json({
      ...track,
      isSaved: false
    });
  } catch (error) {
    console.error('Error fetching track details:', error);
    res.status(500).json({ error: 'Failed to fetch track details' });
  }
};