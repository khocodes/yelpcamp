# YelpCamp


# Initial set up
* Adding landing page
* Add campgrounds page that lists all campgrounds

Each campground has: 
* name
* image

# Layout and Basic styling
* Create our header and footer partials
* Add in Bootstrap

# Creating New campgrounds
* Setup new campground POST route
* Add in body-parser
* Setup route to show form
* Add basic unstyled form

# Style the campground page
* Add a better header/title
* Make campgrounds display in a grid

# Style the Navbar and form
* Add a navbar to all templates
* Style the new campground form




# Add Mongoose
- Install and configure Mongoose
- setup campground model
- use campground model inside of our routes!

# Show Page
- Review the RESTful routes we've seen so far
- Add description to our campground model
- show db.collection.drop() --> will drop database collection
- add a show route/template




# Refactor Mongoose Code
* Create a models directory
* Use module.exports
* Require everything correctly

# Add Seeds File
* Add a seeds.js file
* Run the seeds file every time the server starts
    - sample data to work with

# Add the Comment model!
* Make our errors go away
* Display comments on campground show page




# Comment New/Create
* Discuss nested routes
NEW     campgrounds/:id/comments/new    GET
CREATE  campgrounds/:id/comments
- comments path dependent on campgrounds/:id paths
* Add the comment new and create routes
* Add the new comment form




# Style Show Page
* Add sidebar to show page
* Display comments nicely

# Finish Styling Show Page
* Add public directory
* Add Custom stylesheet




# Auth Part 1: Add User Model
* Install all packages needed for auth
* Define User model

# Auth Part 2: Register
* Configure Passports
* Add register routes
* Add register template

# Auth Part 3: Login
* Add login routes
* Add login template

# Auth Part 4: Logout/Navbar
* Add logout route
* Prevent user from adding a comment if not signed in
* Add links to navbar

# Auth Part 5: Show/Hide Links
* Show/hide auth links in navbar correctly



# Refactor the Routes
* Use Express router to reorganize all routes




# Users + Comments
* Associate users and comments
* Save author's name to a comment automatically



# Users and Campgrounds
* Prevent an unauthenticated user from creating a campground
* Save username + id to newly created campground




# Editing Campgrounds
* Add Method-Override
* Add Edit Route for Campgrounds
* Add Link to Edit Page
* Add Update Route
* Fixed Set problem

# Deleting Campgrounds
* Add Destroy route
* add delete button
* Also removed associated comments with campgrounds from db as well 

# Authorization Part 1: Campgrounds
* Use can only edit his/her campgrounds
* User can only delete his/her campgrounds
* Hide/show edit and delete buttons 

# Editing Comments
* Add Edit route for comments
* Add Edit button
* Add Update route

# Deleting Comments
* Add Destroy route
* Add Delete button

# Authorization Part 2: Comments
* User can only edit his/her comments
* User can only delete his/her comments
* Hide/show edit and delete buttons
* Refactor Middleware




 # Adding in Flash! 
 * Demo working version
 * Install and configure connect-flash
 * Add bootstrap alerts to header



 # Landing page refactor
- Full Screen Background Image Slider: https://github.com/nax3t/background-slider





## ADDITIONAL FEATURES ##

# Dynamic Price Feature

# Refactor Login and Sign Up
- use Bootstrap to style the login & sign up views
- update nav-bar menu
    - convert .container-fluid to regular .container
    - add conditional active class to menu list items
    - add collapsable hamburger menu
    - make site responsive for mobile
- fix registration flash message bug

# Mapbox API (Google maps alternative)
- slides: http://webdev.slides.com/nax3t/yelpcamp-refactor-google-maps#/4
- tutorial for Mapbox set up: https://medium.com/javascript-in-plain-english/using-mapbox-the-simplest-guide-to-get-you-started-cae9896bf999
- Overview:
    - sign up for Mapbox account
    - get Mapbox API key/Access token
    - get another key for Geocoding API
    - add Mapbox scripts to your application
    - display the campground location in show.ejs
    - updated Campground Model, New and Edit forms
        - Made location, lat, long, fields optional. Displayed in form when checkbox is checked. (DOM manipulation)
        - Map is only displayed in show page if location, lat, long fields all filled out
    - updated campground routes: added location, lat, lng variables
    - updated show.ejs to display coordinates and hide when screen < medium size

# Moment JS (Time passed since date created)
- install moment js
    npm install --save moment
- require moment and add it to app.locals
- update campground and comment models
- use moment in your show.ejs file
 * note: campgrounds created prior, did not have 'createdAt' in model so will have 'a few seconds ago' as time passed

 # Admin User Role Authorization
 - update User.js model with isAdmin property
 - update register.ejs form to include Admin code input
 - update register route in index.js
    - update views/show.ejs file to indicate when user is admin they can make changes
    - update middleware/index.js so admin is allowed to make changes
 
 # Creating User Profiles
 - update User model to include new properties: avatar, firstName, lastName, email
 - update register.ejs to include new form inputs
 - update register route in index.js
 - create new route for User Profile in index.js
 - add new directory 'users' in 'views', create new show.ejs file in users directory
 - find all campgrounds linked to user and display in user profile

 # Password Reset
 - install async and nodemailer; require in routes file: index.js. Require crypto(part of express, no need to install)
    npm i -s async nodemailer
- create 'forgot password' get & post route path, create new file 'forgot.ejs' in views directory
    - User model needs to updated: email (constraints), resetPasswordToken, resetPasswordExpires
    - test with email
- create 'reset password' get & post route path, create new file 'reset.ejs' in views directory

# Create Fuzzy Search
- insert form into jumbotron in campgrounds/index.ejs file
- use eval(require('locus')); -- 'req.query.search' will display what was searched in search bar
- update index route in campgrounds.js to include regex function to return fuzzy matches
    - more info on Regex function: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace
    - update campgrounds/index.ejs file to display message if no matches 

# Image Upload
https://github.com/nax3t/image_upload_example/tree/edit-delete
- sign up for cloudinary (where pics will be stored to use)
- install multer & cloudinary: npm i -S multer cloudinary
- update campgrounds/new.ejs, edit.ejs file to include image upload feature
    - name property updated so req.body.campground can be passed into Create route for routes/campgrounds.js
- add multer and cloudinary config to routes/campground.js
    - export cloudinary APIs to use 
- update CREATE route in routes/campgrounds.js
- update UPDATE route in routes/campground.js
    - update campground.js model to include ImageId property
- update DESTROY route in routes/campground.js to remove image from cloudinary server

# YelpCamp Notifications Walk-through
- A follower will be able to receive a notification when the person they followed posted a new campground
- routes/index.js
    - modify User Profile route in index.js so 'followers' are populated for the foundUser
    - add a 'follow user' route
    - add a 'view all notifications' route
    - add 'handle notification' route: when notification is clicked on, redirected to the new campground page
    - update app.use middleware code to be able to display new notifications for logged in user
- update User model to include notifications and followers properties
- create Notifications model
- update header.ejs to display notifications in navbar
- routes/campgrounds.js
    - require Notifications model at top
    - update 'CREATE' route to notify current user's followers that user created a new campground post by creating a new notification




# Refactor Callbacks with Async + Await
- refactored seed file & cleaned up some other files

# Migrating to Boostrap 4
- Header.ejs
    - update with Bootstrap 4 cdn 
    - navbar
    - dropdown-item class added to notification links
- footer.ejs
    - update jquery & javascript cdn
- views
    - campgrounds
        - index.ejs
            - change from thumbnail to card
        - login.ejs, register.ejs, new.ejs, edit.ejs
            - headers are inside a div tag with col-md-12 class 
        - show.ejs
            - update thumbnail to card
    - users
        - show.ejs --> update thumbnail to card




# Final changes
- set up environmental variables
- added Font awesome cdn to header and campground icon to navbar 

