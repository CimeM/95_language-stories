FROM ruby:3.1

WORKDIR /app

COPY Gemfile /app/.
RUN bundle install


RUN gem install json 
RUN gem install sass-embedded 
RUN gem install faraday 

COPY . .

EXPOSE 4000

# RUN bundle exec jekyll clean
# RUN bundle exec jekyll build

CMD ["bundle", "exec", "jekyll", "serve", "--trace", "--host", "0.0.0.0", "--verbose"]