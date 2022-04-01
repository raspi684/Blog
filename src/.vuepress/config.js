module.exports = {
  title: 'Just a blog',
  description: 'Mostly about coding',
  theme: require.resolve('../../'),
  themeConfig: {
    /**
     * Ref: https://vuepress-theme-blog.billyyyyy3320.com/config/#dateformat
     */

    dateFormat: 'DD MMM YYYY',

    /**
     * Ref: https://vuepress-theme-blog.billyyyyy3320.com/config/#nav
     */

    // nav: [
    //   {
    //     text: 'Blog',
    //     link: '/',
    //   },
    //   {
    //     text: 'Tags',
    //     link: '/tag/',
    //   },
    //   {
    //     text: 'Location',
    //     link: '/location/',
    //   },
    // ],

    /**
     * Ref: https://vuepress-theme-blog.billyyyyy3320.com/config/#footer
     */
    footer: {
      contact: [
        {
          type: 'github',
          link: 'https://github.com/rasp684',
        },
        {
          type: 'linkedin',
          link: 'https://www.linkedin.com/in/dominikwawrzynczak/',
        },
      ],
    },
    /**
     * Ref: https://vuepress-theme-blog.billyyyyy3320.com/config/#directories
     */

    // directories:[
    //   {
    //     id: 'post',
    //     dirname: '_posts',
    //     path: '/',
    //     itemPermalink: '/:year/:month/:day/:slug',
    //   },
    //   {
    //     id: 'writing',
    //     dirname: '_writings',
    //     path: '/',
    //     itemPermalink: '/:year/:month/:day/:slug',
    //   },
    // ],

    /**
     * Ref: https://vuepress-theme-blog.billyyyyy3320.com/config/#frontmatters
     */

    // frontmatters: [
    //   {
    //     id: "tag",
    //     keys: ['tag', 'tags'],
    //     path: '/tag/',
    //   },
    //   {
    //     id: "location",
    //     keys: ['location'],
    //     path: '/location/',
    //   },
    // ],

    /**
     * Ref: https://vuepress-theme-blog.billyyyyy3320.com/config/#globalpagination
     */

    // globalPagination: {
    //   lengthPerPage: 10,
    // },

    /**
     * Ref: https://vuepress-theme-blog.billyyyyy3320.com/config/#sitemap
     */
    sitemap: {
      hostname: 'https://blog.dominikwawrzynczak.pl/'
    },
    /**
     * Ref: https://vuepress-theme-blog.billyyyyy3320.com/config/#comment
     */
    comment: {
      service: 'disqus',
      shortname: 'wawrzynczak-net',
    },
    /**
     * Ref: https://vuepress-theme-blog.billyyyyy3320.com/config/#newsletter
     */
    // newsletter: {
    //   endpoint: 'https://billyyyyy3320.us4.list-manage.com/subscribe/post?u=4905113ee00d8210c2004e038&amp;id=bd18d40138'
    // },
    /**
     * Ref: https://vuepress-theme-blog.billyyyyy3320.com/config/#feed
     */
    feed: {
      canonical_base: 'https://blog.dominikwawrzynczak.pl/',
    },

    /**
     * Ref: https://vuepress-theme-blog.billyyyyy3320.com/config/#summary
     */

    // summary:false,

    /**
     * Ref: https://vuepress-theme-blog.billyyyyy3320.com/config/#summarylength
     */

    summaryLength: 250,

    /**
     * Ref: https://vuepress-theme-blog.billyyyyy3320.com/config/#pwa
     */

    // pwa:true,

    /**
     * Ref: https://vuepress-theme-blog.billyyyyy3320.com/config/#paginationcomponent
     */

    // paginationComponent: 'SimplePagination'

    /**
     * Ref: https://vuepress-theme-blog.billyyyyy3320.com/config/#smoothscroll
     */
    smoothScroll: true
  },
}
