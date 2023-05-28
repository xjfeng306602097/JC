FROM shaw1993/php8-fpm:8888-imagick-v6

COPY start.sh /opt/sh/start.sh

RUN chmod +x /opt/sh/start.sh

ADD . /app/www/site

WORKDIR /app/www/site

RUN chown -R www-data:www-data /app/www/site

RUN chmod a+rwx -R /app/www/site/public

RUN chmod a+rwx -R /app/www/site/runtime
