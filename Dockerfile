FROM node:20.11.0-bookworm

# Set an env variable for the location of the app files
ENV APP_HOME=/opt/node/app

# Install helper utilities for gcloud deployment management
RUN wget -q https://www.postgresql.org/media/keys/ACCC4CF8.asc -O - | apt-key add - && \
    echo "deb http://apt.postgresql.org/pub/repos/apt/ bookworm-pgdg main" >> /etc/apt/sources.list.d/pgdg.list && \
    apt-get update -y && \
    apt-get install -y postgresql-client-15

# update path to include any installed node module executables
RUN echo "export PATH=./node_modules/.bin:\$PATH\n" >> /root/.bashrc

# Create a directory for the server app to run from
RUN mkdir -p $APP_HOME

# Add the project files into the app directory and set as working directory
ADD . $APP_HOME
WORKDIR $APP_HOME

# Install dependencies for the main app
RUN npm install
