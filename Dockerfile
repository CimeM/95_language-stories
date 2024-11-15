FROM ruby:3.1

WORKDIR /app

COPY Gemfile /app/.
RUN bundle install

RUN gem install json -v '2.7.5'
RUN gem install sass-embedded -v '1.80.5'
RUN gem install faraday -v '2.12.0'
COPY . .

EXPOSE 4000

CMD ["bundle", "exec", "jekyll", "serve", "--trace", "--host", "0.0.0.0", "--verbose"]