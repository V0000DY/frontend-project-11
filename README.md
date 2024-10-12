### Hexlet tests and linter status:
[![Actions Status](https://github.com/V0000DY/frontend-project-11/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/V0000DY/frontend-project-11/actions)
[![Actions Status](https://github.com/V0000DY/frontend-project-11/actions/workflows/eslint-check.yml/badge.svg)](https://github.com/V0000DY/frontend-project-11/actions)
[![Maintainability](https://api.codeclimate.com/v1/badges/cf86ef33cba9b27dbaf4/maintainability)](https://codeclimate.com/github/V0000DY/frontend-project-11/maintainability)
# RSS-reader
"Rss-reader" is a service for aggregating RSS feeds, which makes it convenient to read various sources, such as blogs. It allows you to add an unlimited number of RSS feeds, updates them and adds new entries to the general flow.
## Live service
To view the result, click the link: [**Rss-reader**](https://frontend-project-11-nu-three.vercel.app/).
## Requirements
Node version: 22.0.0
## Install
### Installation via command line
In order to install, clone the repository and run the following command in your terminal:
```bash
git clone https://github.com/V0000DY/frontend-project-11.git
cd frontend-project-11
npm install
```
## Development
### Preparing for deployment
Firstable, you need to perform a clean install of node dependencies:
```bash
make install
```
### Build
Build the project using webpack:
```bash
make build
```
### Host
Host the project on your local server and go into development mode:
```bash
make develop
```