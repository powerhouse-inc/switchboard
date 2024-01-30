FROM nginx:stable
ENV PORT=80

ENV BACKEND=https://ph-switchboard-api-prod-2f0358a27fa5.herokuapp.com
ENV FRONTEND=https://ph-switchboard-api-prod-2f0358a27fa5.herokuapp.com
ENV WUNDERGRAPH=https://ph-switchboard-api-prod-2f0358a27fa5.herokuapp.com

COPY nginx.conf /etc/nginx/conf.d/default.conf.template
CMD /bin/sh -c "envsubst '\$PORT,\$BACKEND,\$FRONTEND,\$WUNDERGRAPH' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf" && nginx -g 'daemon off;'

