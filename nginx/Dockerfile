FROM nginx:stable
ENV PORT=80

ENV BASE_PATH="/makerdao/switchboard"
ENV BACKEND=https://ph-switchboard-api-prod-2f0358a27fa5.herokuapp.com
ENV FRONTEND=https://ph-switchboard-frontend-prod-2030e418555a.herokuapp.com
ENV WUNDERGRAPH=https://ph-switchboard-wgraph-prod-46a95adab5b7.herokuapp.com

COPY nginx.conf /etc/nginx/conf.d/default.conf.template
CMD /bin/sh -c "envsubst '\$BASE_PATH,\$PORT,\$BACKEND,\$FRONTEND,\$WUNDERGRAPH' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf" && nginx -g 'daemon off;'

