import fp from 'fastify-plugin';

export default fp(async function (fastify) {
  fastify.decorateReply(
    'setPaginationHeaders',
    function (page, perPage, total) {
      const reply = this;
      const pageNum = parseInt(page, 10);
      const perPageNum = parseInt(perPage, 10);
      const pages = Math.ceil(total / perPageNum);
      const {
        request: {
          protocol,
          hostname,
          routeOptions: { url },
          query,
        },
      } = reply;
      const [host, port] = hostname.split(':');
      const baseUrl = `${protocol}://${host}${port !== '80' && port !== '443' ? `:${port}` : ''}${url}?`;
      let Link = '';
      if (pageNum < pages) {
        Link += `<${baseUrl}${new URLSearchParams({ ...query, page: pageNum + 1 }).toString()}>; rel="next"`;
      }
      if (pageNum < pages - 1) {
        if (Link.length > 0) {
          Link += ',';
        }
        Link += `<${baseUrl}${new URLSearchParams({ ...query, page: pages }).toString()}>; rel="last"`;
      }
      if (pageNum > 2) {
        if (Link.length > 0) {
          Link += ',';
        }
        Link += `<${baseUrl}${new URLSearchParams({ ...query, page: 1 }).toString()}>; rel="first"`;
      }
      if (pageNum > 1) {
        if (Link.length > 0) {
          Link += ',';
        }
        Link += `<${baseUrl}${new URLSearchParams({ ...query, page: pageNum - 1 }).toString()}>; rel="prev"`;
      }
      reply.header('Link', Link);
      reply.header('X-Page', page);
      reply.header('X-Per-page', perPage);
      reply.header('X-Total-Count', total);
      reply.header('X-Total-Pages', pages);
      return reply;
    },
  );
});
