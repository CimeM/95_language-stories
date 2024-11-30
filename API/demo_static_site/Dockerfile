FROM nginx:stable-alpine3.17-slim

# Copy the static website files to the Nginx server
COPY index.html /usr/share/nginx/html/
# COPY styles.css /usr/share/nginx/html/ # If you have a CSS file
# COPY script.js /usr/share/nginx/html/ # If you have a JavaScript file

# Copy any other static assets you might have
# COPY assets/ /usr/share/nginx/html/assets/

# Expose port 80
EXPOSE 80

# Start Nginx when the container launches
CMD ["nginx", "-g", "daemon off;"]