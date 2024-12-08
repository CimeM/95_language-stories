FROM ruby:3.1

WORKDIR /app

COPY Gemfile /app/.
RUN bundle install


RUN gem install json 
RUN gem install sass-embedded 
RUN gem install faraday 

COPY . .

RUN bundle update
RUN gem install faraday -v 2.12.0
RUN gem install logger -v 1.6.1
# RUN gem install jekyll-include-cache



# connects to public API 
#CMD ["bundle", "exec", "jekyll", "serve", "--trace", "--host", "0.0.0.0", "--verbose"]

# local development - connect to localhost api 
CMD ["bundle", "exec", "jekyll", "serve", "--trace", "--host", "0.0.0.0", "--verbose"]