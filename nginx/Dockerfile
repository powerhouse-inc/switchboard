FROM nginx:stable
ENV PORT=80

ENV BACKEND=http://127.0.0.1:3000
ENV FRONTEND=http://frontend:3000
ENV WUNDERGRAPH=http://wundergraph:3002

COPY nginx.conf /etc/nginx/conf.d/default.conf.template
CMD /bin/sh -c "envsubst '\$PORT,\$BACKEND,\$FRONTEND,\$WUNDERGRAPH' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf" && nginx -g 'daemon off;'

