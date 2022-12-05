# Unicorns Are Real

## Introduction
What are unicorn companies? In which industries are unicorns most prevalent?
Which countries have the most unicorns? This visualization project strives to
answer all these questions in a creative and whimsical way while
telling a story through data.

**Team Members**: Sergio Jara-Reynoso, Raelene Angle-Graves, and Janna Withrow

* URL to website: 
* URL to video: 
* Process Book: https://docs.google.com/document/d/1wEagQ-3r0DURYKKXNXdW8vBZwNo271af45DcZML9dgQ/edit?usp=sharing

**Note: This project is optimized for viewing in full screen mode on a computer, which was specified to be the staffs'
general expectation on Ed.**

## Project Structure
- `css/`: files that influence styling
  - `styles.css`: stylesheet attributes
- `data/`: cleaned data and helper files for visualizations
  - `parliamentSeats.csv`: used to help render the second visualization
  - `Unicorn_Companiesv4.csv`: main dataset used for all visualizations
  - `unicorns_per_country.csv`: used to color the map visualization and populate its tooltip values
  - `world-110m.json`: used to draw the map visualization
- `images/`: image file
  - `unicorn_sketch_black_background.jpg`: the hand-drawn, customized icon used on cover page
- `js/`: javascript files for each individual visualization
  - `areavis.js`: stacked area chart; the left side of the third visualization
  - `circlevis.js`: **innovative visualization** for displaying details about unicorns; fifth visualization
  - `histovis.js`: histogram; the right side of the third visualization
  - `main.js`: defines the data and sets the event listener to display it; contains the fixed industries legend
  - `mapvis.js`: choropleth map; fourth visualization
  - `rainbowvis.js`: overview of companies divided by industry; second visualization
- `index.html`: html file for the project 

Run index.html from within WebStorm to view the project in any browser.

## Libraries Used
  - [d3-geo](https://github.com/d3/d3-geo): used to help create a map projection for the fourth visualization.
  - [topojson](https://github.com/topojson/topojson): an extension of GeoJSON that encodes topology that was used to
    help create a map projection for the fourth visualization.
  - [d3-scale-chromatic](https://github.com/d3/d3-scale-chromatic): used to create color schemes that work with 
    d3-scale’s d3.scaleOrdinal and d3.scaleSequential

## Description of the Data
  - Link to the original, uncleaned data set for Unicorn_Companies4.csv:
    https://www.kaggle.com/datasets/deepcontractor/unicorn-companies-dataset
    - Data Fields in the Cleaned and Enhanced Unicorn_Companies4.csv Dataset:
      - Company: names of the 1035 unicorn companies
      - Valuation: current valuation of each company 
      - Date Joined: the date on which a given company became a unicorn company (i.e. achieved a valuation of $1B)
      - Country: the country where a given unicorn company originated
      - City: the city where a given unicorn company originated 
      - Industry: the industry in which a given unicorn company operates 
      - Select Investors: the most notable investors in a given unicorn company 
      - Founded Year: the year that each company was founded 
      - Total Raised: how much each company has raised throughout their investors, themselves, and other private equities 
      - Financial Stage: the financial status (e.g. IPO, Asset, Acquired, etc.) of each company today
      - Investors Count: the number of investors who have a given company in their portfolio 
      - Deal Terms: the number of deal terms at which each company sells their securities 
      - Portfolio Exits: the number of investors that have ceased investment in a given company
      - Years From Founding to Joined: number of years a company has been a unicorn
      - Year Joined: year that a company became a unicorn
  - unicorns_per_country.csv was created in Excel from Unicorn_Companies4.csv for the map visualization
    - Data Fields in unicorns_per_country.csv:
      - Country: a list of every country in the world, as displayed on the choropleth map
      - Unicorns: number of unicorns in a given country