const BookmarkService = {
    getAllBookmarks(knex) {
        return knex.select('*').from('bookmarks')
    }
}

module.exports = BookmarkService