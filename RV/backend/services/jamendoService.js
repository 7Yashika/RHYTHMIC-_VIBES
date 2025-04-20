
const axios = require('axios');
require('dotenv').config();

class JamendoService {
  constructor() {
    this.baseURL = 'https://api.jamendo.com/v3.0';
    this.clientId = process.env.JAMENDO_CLIENT_ID;
    
    if (!this.clientId) {
      console.error('Missing Jamendo Client ID. Set JAMENDO_CLIENT_ID in your .env file.');
    }
  }

  /**
   * Search for tracks on Jamendo with advanced filtering
   * @param {Object} params - Search parameters
   * @param {string} params.query - General search query
   * @param {string} params.name - Track name filter
   * @param {string} params.artist - Artist name filter
   * @param {string} params.album - Album name filter
   * @param {number} params.limit - Number of results to return
   * @param {number} params.offset - Pagination offset
   * @returns {Promise<Array>} Array of track objects
   */
  async searchTracks(params = {}) {
    const {
      query = '',
      name = '',
      artist = '',
      album = '',
      limit = 20,
      offset = 0
    } = params;

    try {
      // Build the search parameters
      const searchParams = {
        client_id: this.clientId,
        format: 'json',
        limit,
        offset,
        include: 'musicinfo+stats'
      };

      // Add specific filters if provided
      if (query) searchParams.search = query;
      if (name) searchParams.name = name;
      if (artist) searchParams.artist_name = artist;
      if (album) searchParams.album_name = album;

      const response = await axios.get(`${this.baseURL}/tracks`, { params: searchParams });

      // Transform to our app's song format
      return response.data.results.map(track => this.transformTrack(track));
    } catch (error) {
      console.error('Error searching Jamendo tracks:', error);
      throw error;
    }
  }

  /**
   * Get popular tracks from Jamendo
   * @param {number} limit - Number of results to return
   * @returns {Promise<Array>} Array of track objects
   */
  async getPopularTracks(limit = 20) {
    try {
      const response = await axios.get(`${this.baseURL}/tracks`, {
        params: {
          client_id: this.clientId,
          format: 'json',
          limit,
          boost: 'popularity',
          include: 'musicinfo+stats'
        }
      });

      return response.data.results.map(track => this.transformTrack(track));
    } catch (error) {
      console.error('Error fetching popular Jamendo tracks:', error);
      throw error;
    }
  }

  /**
   * Get tracks by genre from Jamendo
   * @param {string} genre - Genre to filter by
   * @param {number} limit - Number of results to return
   * @returns {Promise<Array>} Array of track objects
   */
  async getTracksByGenre(genre, limit = 20) {
    try {
      const response = await axios.get(`${this.baseURL}/tracks`, {
        params: {
          client_id: this.clientId,
          format: 'json',
          limit,
          tags: genre,
          include: 'musicinfo+stats'
        }
      });

      return response.data.results.map(track => this.transformTrack(track));
    } catch (error) {
      console.error(`Error fetching ${genre} tracks from Jamendo:`, error);
      throw error;
    }
  }

  /**
   * Get track details by ID
   * @param {string} trackId - Jamendo track ID
   * @returns {Promise<Object>} Track object
   */
  async getTrackById(trackId) {
    try {
      const response = await axios.get(`${this.baseURL}/tracks`, {
        params: {
          client_id: this.clientId,
          format: 'json',
          id: trackId,
          include: 'musicinfo+stats+lyrics'
        }
      });

      if (response.data.results.length === 0) {
        throw new Error('Track not found');
      }

      return this.transformTrack(response.data.results[0]);
    } catch (error) {
      console.error('Error fetching Jamendo track details:', error);
      throw error;
    }
  }

  /**
   * Get tracks by artist name
   * @param {string} artistName - Artist name to search for
   * @param {number} limit - Number of results to return
   * @returns {Promise<Array>} Array of track objects
   */
  async getTracksByArtist(artistName, limit = 20) {
    try {
      const response = await axios.get(`${this.baseURL}/tracks`, {
        params: {
          client_id: this.clientId,
          format: 'json',
          limit,
          artist_name: artistName,
          include: 'musicinfo+stats'
        }
      });

      return response.data.results.map(track => this.transformTrack(track));
    } catch (error) {
      console.error(`Error fetching tracks by artist ${artistName}:`, error);
      throw error;
    }
  }

  /**
   * Get tracks by album name
   * @param {string} albumName - Album name to search for
   * @param {number} limit - Number of results to return
   * @returns {Promise<Array>} Array of track objects
   */
  async getTracksByAlbum(albumName, limit = 20) {
    try {
      const response = await axios.get(`${this.baseURL}/tracks`, {
        params: {
          client_id: this.clientId,
          format: 'json',
          limit,
          album_name: albumName,
          include: 'musicinfo+stats'
        }
      });

      return response.data.results.map(track => this.transformTrack(track));
    } catch (error) {
      console.error(`Error fetching tracks from album ${albumName}:`, error);
      throw error;
    }
  }

  /**
   * Transform Jamendo track object to our app's format
   * @param {Object} track - Jamendo track object
   * @returns {Object} Transformed track object
   */
  transformTrack(track) {
    return {
      externalId: track.id,
      title: track.name,
      artist: track.artist_name,
      album: track.album_name,
      genre: track.musicinfo?.tags?.genres?.[0] || '',
      url: track.audio,
      albumArt: track.image,
      duration: track.duration,
      releaseDate: track.releasedate,
      metadata: {
        source: 'jamendo',
        artistId: track.artist_id,
        albumId: track.album_id,
        popularity: track.stats?.popularity || 0,
        listens: track.stats?.listens || 0,
        likes: track.stats?.likes || 0,
        lyrics: track.lyrics || '',
        tags: track.musicinfo?.tags || {}
      }
    };
  }
}

module.exports = new JamendoService();