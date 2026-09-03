# OHIF Viewer with OpenResty (Nginx + Lua)
# Uses pre-built static files from the ohif-viewer directory
FROM openresty/openresty:1.21.4.1-alpine-fat

RUN mkdir -p /var/log/nginx /var/logs/nginx /var/www/html

# Copy OHIF Viewer static build files
COPY . /var/www/html/

# Copy nginx config
COPY nginx.conf /usr/local/openresty/nginx/conf/nginx.conf

# Remove Dockerfile and nginx.conf from served files
RUN rm -f /var/www/html/Dockerfile /var/www/html/nginx.conf

EXPOSE 80

ENTRYPOINT ["/usr/local/openresty/nginx/sbin/nginx", "-g", "daemon off;"]
