const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const mapDBToModel = require('../../utils');

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({ title, year, genre, performer, duration, albumId }) {
    const id = `song-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, genre, performer, duration, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Song gagal ditambahkan.');
    }

    return result.rows[0].id;
  }

  async getSongs({ title, performer }) {
    let filteredSongs = await this._pool.query('SELECT id, title, performer FROM songs');

    if (title && performer) {
      const query = {
        text: 'SELECT id, title, performer FROM songs WHERE title ILIKE $1 AND performer ILIKE $2',
        values: [`%${title}%`, `%${performer}%`],
      };
      filteredSongs = await this._pool.query(query);
    }

    if (title) {
      const query = {
        text: 'SELECT id, title, performer FROM songs WHERE title ILIKE $1',
        values: [`%${title}%`],
      };
      filteredSongs = await this._pool.query(query);
    }

    if (performer) {
      const query = {
        text: 'SELECT id, title, performer FROM songs WHERE performer ILIKE $1',
        values: [`%${performer}%`],
      };
      filteredSongs = await this._pool.query(query);
    }

    return filteredSongs.rows.map(mapDBToModel);
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Song tidak ditemukan.');
    }

    return result.rows.map(mapDBToModel)[0];
  }

  async editSongById(id, { title, year, genre, performer, duration, albumId }) {
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, album_id = $6 WHERE id = $7 RETURNING id',
      values: [title, year, genre, performer, duration, albumId, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui song. Id tidak ditemukan.');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal menghapus song. Id tidak ditemukan.');
    }
  }
}

module.exports = SongsService;
