const Playlist = require('../models/Playlist');
const Song = require('../models/Song');
const mongoose = require('mongoose');

// Helper function to create a new song node
const createSongNode = (songId, prevId = null, nextId = null) => {
  return {
    song: songId,
    prev: prevId,
    next: nextId
  };
};

// Get all playlists for the current user
exports.getUserPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ user: req.user.id })
      .select('name description isPublic isFavorite tags createdAt updatedAt');
    
    res.status(200).json({
      success: true,
      count: playlists.length,
      data: playlists
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get a single playlist with songs populated
exports.getPlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id)
      .populate({
        path: 'songs.song',
        model: 'Song',
        select: 'title artist album duration imageUrl'
      });
    
    if (!playlist) {
      return res.status(404).json({
        success: false,
        error: 'Playlist not found'
      });
    }
    
    // Check if user has access to this playlist
    if (!playlist.isPublic && playlist.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this playlist'
      });
    }
    
    // Sort songs in order using the linked list structure
    const orderedSongs = [];
    if (playlist.head) {
      let currentNodeId = playlist.head;
      while (currentNodeId) {
        const songNode = playlist.songs.find(node => node._id.toString() === currentNodeId.toString());
        if (songNode && songNode.song) {
          orderedSongs.push(songNode.song);
        }
        currentNodeId = songNode ? songNode.next : null;
      }
    }
    
    const result = {
      _id: playlist._id,
      name: playlist.name,
      description: playlist.description,
      isPublic: playlist.isPublic,
      isFavorite: playlist.isFavorite,
      tags: playlist.tags,
      user: playlist.user,
      songs: orderedSongs,
      createdAt: playlist.createdAt,
      updatedAt: playlist.updatedAt
    };
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Create a new playlist
exports.createPlaylist = async (req, res) => {
  try {
    const { name, description, isPublic, isFavorite, tags } = req.body;
    
    const playlist = await Playlist.create({
      name,
      description,
      isPublic,
      isFavorite,
      tags,
      user: req.user.id,
      songs: [],
      head: null,
      tail: null
    });
    
    res.status(201).json({
      success: true,
      data: playlist
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      
      return res.status(400).json({
        success: false,
        error: messages
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  }
};

// Update a playlist
exports.updatePlaylist = async (req, res) => {
  try {
    const { name, description, isPublic, isFavorite, tags } = req.body;
    
    const playlist = await Playlist.findById(req.params.id);
    
    if (!playlist) {
      return res.status(404).json({
        success: false,
        error: 'Playlist not found'
      });
    }
    
    // Check ownership
    if (playlist.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this playlist'
      });
    }
    
    // Update fields
    if (name) playlist.name = name;
    if (description !== undefined) playlist.description = description;
    if (isPublic !== undefined) playlist.isPublic = isPublic;
    if (isFavorite !== undefined) playlist.isFavorite = isFavorite;
    if (tags) playlist.tags = tags;
    
    await playlist.save();
    
    res.status(200).json({
      success: true,
      data: playlist
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Delete a playlist
exports.deletePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    
    if (!playlist) {
      return res.status(404).json({
        success: false,
        error: 'Playlist not found'
      });
    }
    
    // Check ownership
    if (playlist.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this playlist'
      });
    }
    
    await playlist.remove();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Add a song to a playlist (at the end)
exports.addSong = async (req, res) => {
  try {
    const { songId } = req.body;
    
    // Find playlist and validate ownership
    const playlist = await Playlist.findById(req.params.id);
    
    if (!playlist) {
      return res.status(404).json({
        success: false,
        error: 'Playlist not found'
      });
    }
    
    if (playlist.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to modify this playlist'
      });
    }
    
    // Verify song exists
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({
        success: false,
        error: 'Song not found'
      });
    }
    
    // Create a new song node
    const newSongNode = createSongNode(songId);
    
    // Add to linked list
    if (!playlist.head) {
      // First song in playlist
      const savedNode = playlist.songs.create(newSongNode);
      playlist.songs.push(savedNode);
      playlist.head = savedNode._id;
      playlist.tail = savedNode._id;
    } else {
      // Add to the end
      const tailNode = playlist.songs.id(playlist.tail);
      const savedNode = playlist.songs.create(newSongNode);
      savedNode.prev = playlist.tail;
      
      playlist.songs.push(savedNode);
      tailNode.next = savedNode._id;
      playlist.tail = savedNode._id;
    }
    
    await playlist.save();
    
    res.status(200).json({
      success: true,
      data: playlist
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Remove a song from playlist
exports.removeSong = async (req, res) => {
  try {
    const { songNodeId } = req.params;
    
    // Find playlist and validate ownership
    const playlist = await Playlist.findById(req.params.id);
    
    if (!playlist) {
      return res.status(404).json({
        success: false,
        error: 'Playlist not found'
      });
    }
    
    if (playlist.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to modify this playlist'
      });
    }
    
    // Find the song node to remove
    const songNode = playlist.songs.id(songNodeId);
    if (!songNode) {
      return res.status(404).json({
        success: false,
        error: 'Song not found in playlist'
      });
    }
    
    // Update linked list connections
    if (songNode.prev && songNode.next) {
      // Middle node
      const prevNode = playlist.songs.id(songNode.prev);
      const nextNode = playlist.songs.id(songNode.next);
      
      prevNode.next = songNode.next;
      nextNode.prev = songNode.prev;
    } else if (songNode.prev) {
      // Last node
      const prevNode = playlist.songs.id(songNode.prev);
      prevNode.next = null;
      playlist.tail = songNode.prev;
    } else if (songNode.next) {
      // First node
      const nextNode = playlist.songs.id(songNode.next);
      nextNode.prev = null;
      playlist.head = songNode.next;
    } else {
      // Only node
      playlist.head = null;
      playlist.tail = null;
    }
    
    // Remove song node
    playlist.songs.pull(songNodeId);
    
    await playlist.save();
    
    res.status(200).json({
      success: true,
      data: playlist
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Reorder songs (move a song to a specific position)
exports.reorderSongs = async (req, res) => {
  try {
    const { id: playlistId } = req.params;
    const { songId, newIndex } = req.body;

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) return res.status(404).json({ error: 'Playlist not found' });
    if (playlist.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const index = playlist.songs.indexOf(songId);
    if (index === -1 || newIndex < 0 || newIndex >= playlist.songs.length) {
      return res.status(400).json({ error: 'Invalid operation' });
    }

    // Remove songId from current linked list
    const prev = playlist.prev[songId];
    const next = playlist.next[songId];

    if (prev) playlist.next[prev] = next;
    else playlist.head = next;

    if (next) playlist.prev[next] = prev;
    else playlist.tail = prev;

    delete playlist.prev[songId];
    delete playlist.next[songId];

    playlist.songs.splice(index, 1);
    playlist.songs.splice(newIndex, 0, songId);

    // Rebuild linked list pointers
    playlist.prev = {};
    playlist.next = {};
    for (let i = 0; i < playlist.songs.length; i++) {
      const current = playlist.songs[i];
      const prev = i > 0 ? playlist.songs[i - 1] : null;
      const next = i < playlist.songs.length - 1 ? playlist.songs[i + 1] : null;
      if (prev) playlist.prev[current] = prev;
      if (next) playlist.next[current] = next;
    }
    playlist.head = playlist.songs[0];
    playlist.tail = playlist.songs[playlist.songs.length - 1];

    await playlist.save();
    res.json({ message: 'Song reordered', playlist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};