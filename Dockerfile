FROM ubuntu:14.04

MAINTAINER Rhett Lowe <rng2ml@gmail.com>

ENV DEBIAN_FRONTEND noninteractive

RUN sed 's/main$/main universe/' -i /etc/apt/sources.list
RUN apt-get update
RUN apt-get upgrade -y
RUN apt-get install -y curl build-essential wget

# Download and install wkhtmltopdf
RUN apt-get install -y xorg libssl-dev libxrender-dev gdebi xvfb libicu52 xfonts-75dpi
RUN wget http://download.gna.org/wkhtmltopdf/0.12/0.12.3/wkhtmltox-0.12.3_linux-generic-amd64.tar.xz
RUN tar -xvJf wkhtmltox-0.12.3_linux-generic-amd64.tar.xz -C /usr/local/
ENV PATH /usr/local/wkhtmltox/bin:$PATH

# Install Nodejs
RUN curl -sL https://deb.nodesource.com/setup_4.x | bash
RUN apt-get install -y nodejs
RUN npm install --global npm

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
run npm install

copy . /usr/src/app

EXPOSE 8080
CMD [ "npm", "start" ]
