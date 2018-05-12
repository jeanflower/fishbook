TripsList = new Mongo.Collection('trips');
LocationsList = new Mongo.Collection('locations');
CatchesList = new Mongo.Collection('catches');

////////////////////////////////////////
// The Client
////////////////////////////////////////
if(Meteor.isClient){

  Meteor.subscribe('theTrips');
  Meteor.subscribe('theLocations');
  Meteor.subscribe('theCatches');


  ////////////////////////////////////////
  // Event handling for adding a location 
  Template.addLocationForm.events({
    'submit form': function(event){
      event.preventDefault();
      var locationNameVar = event.target.locationName.value;
      Meteor.call('insertLocationData', locationNameVar);
    }
  });

  var getSelectedLocation = function(){
      var selectedLocation = Session.get('selectedLocation');
      return LocationsList.findOne(selectedLocation)    
  }

  var getSelectedTrip = function(){
      var selectedTrip = Session.get('selectedTrip');
      return TripsList.findOne(selectedTrip)
  }

  /////////////////////////////////////////////
  // All helper functions for the locationboard
  Template.locationboard.helpers({ 
    // get all locations (accessible for this user)
    'location': function(){
      return LocationsList.find({});
    },
    // find out whether this location is the one set as 
    // currently selected for this Session
    'selectedLocation': function(){
      var locationId = this._id;
      var selectedLocation = Session.get('selectedLocation');
      if(locationId == selectedLocation){
          return "selected"
      }
    },
    // get the location which is the selected one
    'showSelectedLocation': getSelectedLocation,
    });

  ////////////////////////////////////////
  // Event handling for the location board
  Template.locationboard.events({ 
    'click .location': function(){
      var locationId = this._id;
      if(Session.get('selectedLocation') == locationId){
        console.log("reclicking existing location")
        return;
      }
      //console.log("selected location ID = "+locationId)
      Session.set('selectedLocation', locationId);
      Session.set('selectedTrip', undefined);
    },
    'click .remove': function(){
      var selectedLocation = Session.get('selectedLocation');
      Meteor.call('removeLocationData', selectedLocation);
      Session.set('selectedLocation', undefined);
    }
  });


  Template.addTripForm.helpers({
    // get the location which is the selected one
    'showSelectedLocation': getSelectedLocation,
  });
  ///////////////////////////////////
  // Event handling for adding a trip 
  Template.addTripForm.events({
    'submit form': function(event){
      event.preventDefault();
      var tripNameVar = event.target.tripName.value;
      var selectedLocation = Session.get('selectedLocation');
      //console.log("new trip: "+tripNameVar+" located at "+selectedLocation)
      //console.log(" location name "+LocationsList.findOne(selectedLocation).name)
      Meteor.call('insertTripData', 
                  { trip:tripNameVar, 
                    location:selectedLocation});
    }
  });

  /////////////////////////////////////////
  // All helper functions for the tripboard
  Template.tripboard.helpers({ 
    // get all trips (accessible for this user)
    'trip': function(){
      var selectedLocation = Session.get('selectedLocation');
      return TripsList.find({location : selectedLocation}, 
                            {sort: {name: 1}});
    },
    // find out whether this trip is the one set as 
    // currently selected for this Session
    'selectedTrip': function(){
      var tripId = this._id;
      var selectedTrip = Session.get('selectedTrip');
      //console.log("compare tripId "+tripId+" and selectedTrip "+selectedTrip)
      if(tripId == selectedTrip){
        return "selected"
      } else {
        return ""
      }
    },
    // get the trip which is the selected one
    'showSelectedTrip': getSelectedTrip,
    // get the location which is the selected one
    'showSelectedLocation': getSelectedLocation,
    });

  ////////////////////////////////////
  // Event handling for the trip board
  Template.tripboard.events({ 
    // what happens when someone clicks on a trip
    'click .trip': function(){
      var tripId = this._id;
      //console.log("clicked on trip = "+this)
      //console.log("selected trip ID = "+tripId)
      Session.set('selectedTrip', tripId);
    },
    // what happens when someone increments a trip
    'click .increment': function(){
      var selectedTrip = Session.get('selectedTrip');
      //console.log("selected trip ID = "+selectedTrip)
      Meteor.call('modifyTripScore', selectedTrip, 1);
    },
    // what happens when someone removes a trip
    'click .remove': function(){
      var selectedTrip = Session.get('selectedTrip');
      Meteor.call('removeTripData', selectedTrip);
      Session.set('selectedTrip', undefined);
    }
  });

  Template.addCatchForm.helpers({
    // get the location which is the selected one
    'showSelectedTrip': getSelectedTrip,
  });

  ///////////////////////////////////
  // Event handling for adding a catch 
  Template.addCatchForm.events({
    'submit form': function(event){
      event.preventDefault();
      var catchNameVar = event.target.catchName.value;
      var selectedTrip = Session.get('selectedTrip');
      //console.log("new catch: "+catchNameVar+" on trip "+selectedTrip)
      Meteor.call('insertCatchData', 
                  { catch:catchNameVar, 
                    trip:selectedTrip});
    }
  });
  /////////////////////////////////////////
  // All helper functions for the catchboard
  Template.catchboard.helpers({ 
    // get the trip which is the selected one
    'showSelectedTrip': getSelectedTrip,

    // get all trips (accessible for this user)
    'catch': function(){
      var selectedTrip = Session.get('selectedTrip');
      return CatchesList.find({trip : selectedTrip}, 
                              {sort: {name: 1}});
    },
    // find out whether this trip is the one set as 
    // currently selected for this Session
    'selectedCatch': function(){
      var catchId = this._id;
      var selectedCatch = Session.get('selectedCatch');
      if(catchId == selectedCatch){
        return "selected"
      } else {
        return ""
      }
    },
    // get the trip which is the selected one
    'showSelectedCatch': function(){
      var selectedCatch = Session.get('selectedCatch');
      return CatchesList.findOne(selectedCatch)
    },
    });
}

////////////////////////////////////////
// The Server
////////////////////////////////////////
if(Meteor.isServer){

  // Only publish trips for the current user
  Meteor.publish('theTrips', function(){
    var currentUserId = this.userId;
    return TripsList.find({createdBy: currentUserId})
  });
  // Only publish locations for the current user
  Meteor.publish('theLocations', function(){
    var currentUserId = this.userId;
    return LocationsList.find({createdBy: currentUserId})
  });
  // Only publish catches for the current user
  Meteor.publish('theCatches', function(){
    var currentUserId = this.userId;
    return CatchesList.find({createdBy: currentUserId})
  });

  Meteor.methods({
    ///////////////////
    // Add new location 
    'insertLocationData': function(locationNameVar){
      var currentUserId = Meteor.userId();
      console.log("insert locationNameVar = "+locationNameVar)
      //console.log("adding location for user id = "+currentUserId)
      //console.log("before add, we have "+LocationsList.find({}).count())
      LocationsList.insert({
          name: locationNameVar,
          createdBy: currentUserId
      });
      LocationsList.find({}).forEach(function(loc){
        console.log("location "+loc.name)
      })
      //console.log("after add, we have "+LocationsList.find({}).count())
    },
    //////////////////
    // Remove location 
    'removeLocationData': function(selectedLocation){
      var currentUserId = Meteor.userId();
      LocationsList.remove({_id: selectedLocation, createdBy: currentUserId});
    },

    ///////////////
    // Add new trip 
    'insertTripData': function(insertTripData){
      var currentUserId = Meteor.userId();
      locationName = LocationsList.findOne(insertTripData.location).name
      //console.log("adding trip for user id = "+currentUserId)
      //console.log("adding trip called = "+insertTripData.trip)
      //console.log("adding trip at = "+insertTripData.location)
      //console.log("adding trip at = "+locationName)
        
      TripsList.insert({
          name: insertTripData.trip,
          location: insertTripData.location,
          locationName: locationName,
          score: 0,
          createdBy: currentUserId
      });

      TripsList.find({}).forEach(function(trip){
        console.log("trip "+trip.name)
      })
    },

    ///////////////
    // Remove trip 
    'removeTripData': function(selectedTrip){
      var currentUserId = Meteor.userId();
      TripsList.remove({_id: selectedTrip, createdBy: currentUserId});
    },

    ///////////////
    // Change trip 
    'modifyTripScore': function(selectedTrip, scoreValue){
      var currentUserId = Meteor.userId();
      TripsList.update( {_id: selectedTrip, createdBy: currentUserId},
                          {$inc: {score: scoreValue} });
    },

    ///////////////
    // Add new catch 
    'insertCatchData': function(insertCatchData){
      var currentUserId = Meteor.userId();
      tripName = TripsList.findOne(insertCatchData.trip).name
      console.log("adding catch for user id = "+currentUserId)
      console.log("adding catch called = "+insertCatchData.catch)
      console.log("adding catch on trip = "+insertCatchData.trip)
      console.log("adding catch at = "+tripName)
        
      CatchesList.insert({
          name: insertCatchData.catch,
          trip: insertCatchData.trip,
          tripName: tripName,
          createdBy: currentUserId
      });

      CatchesList.find({}).forEach(function(ctch){
        console.log("catch "+ctch.name)
      })
    },
    //////////////////
    // Remove catch 
    'removeCatchData': function(selectedCatch){
      var currentUserId = Meteor.userId();
      CatchesList.remove({_id: selectedCatch, createdBy: currentUserId});
    },

  })   
}