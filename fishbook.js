TripsList = new Mongo.Collection('trips');
LocationsList = new Mongo.Collection('locations');

if(Meteor.isClient){

  Meteor.subscribe('theTrips');
  Meteor.subscribe('theLocations');

  Template.tripboard.helpers({ 
    'trip': function(){
      return TripsList.find({}, {sort: {name: 1}});
    },
    'selectedTrip': function(){
      var tripId = this._id;
      var selectedTrip = Session.get('selectedTrip');
      if(tripId == selectedTrip){
          return "selected"
      }
    },
    'showSelectedTrip': function(){
      var selectedTrip = Session.get('selectedTrip');
      return TripsList.findOne(selectedTrip)
    },
    });

  Template.locationboard.helpers({ 
    'location': function(){
      return LocationsList.find({});
    },
    'selectedLocation': function(){
      var locationId = this._id;
      var selectedLocation = Session.get('selectedLocation');
      if(locationId == selectedLocation){
          return "selected"
      }
    },
    'showSelectedLocation': function(){
      var selectedLocation = Session.get('selectedLocation');
      return LocationsList.findOne(selectedLocation)
    },
    });

  Template.tripboard.events({ 
    'click .trip': function(){
      var tripId = this._id;
      //console.log("selected trip ID = "+tripId)
      Session.set('selectedTrip', tripId);
    },
    'click .increment': function(){
      var selectedTrip = Session.get('selectedTrip');
      //console.log("selected trip ID = "+selectedTrip)
      Meteor.call('modifyTripScore', selectedTrip, 1);
    },
    'click .remove': function(){
      var selectedTrip = Session.get('selectedTrip');
      Meteor.call('removeTripData', selectedTrip);
    }
  });
  Template.locationboard.events({ 
    'click .location': function(){
      var locationId = this._id;
      //console.log("selected location ID = "+locationId)
      Session.set('selectedLocation', locationId);
    },
    'click .remove': function(){
      var selectedLocation = Session.get('selectedLocation');
      Meteor.call('removeLocationData', selectedLocation);
    }
  });
  Template.addTripForm.events({
    'submit form': function(event){
      event.preventDefault();
      var tripNameVar = event.target.tripName.value;
      Meteor.call('insertTripData', tripNameVar);
    }
  });
  Template.addLocationForm.events({
    'submit form': function(event){
      event.preventDefault();
      var locationNameVar = event.target.locationName.value;
      Meteor.call('insertLocationData', locationNameVar);
    }
  });

}

if(Meteor.isServer){

  Meteor.publish('theTrips', function(){
    var currentUserId = this.userId;
    return TripsList.find({createdBy: currentUserId})
  });
  Meteor.publish('theLocations', function(){
    var currentUserId = this.userId;
    return LocationsList.find({createdBy: currentUserId})
  });

  Meteor.methods({
    'insertTripData': function(tripNameVar){
      var currentUserId = Meteor.userId();
      //console.log("adding trip for user id = "+currentUserId)
      TripsList.insert({
          name: tripNameVar,
          score: 0,
          createdBy: currentUserId
      });
    },
    'removeTripData': function(selectedTrip){
      var currentUserId = Meteor.userId();
      TripsList.remove({_id: selectedTrip, createdBy: currentUserId});
    },
    'modifyTripScore': function(selectedTrip, scoreValue){
      var currentUserId = Meteor.userId();
      TripsList.update( {_id: selectedTrip, createdBy: currentUserId},
                          {$inc: {score: scoreValue} });
    },
    'insertLocationData': function(locationNameVar){
      var currentUserId = Meteor.userId();
      //console.log("adding location for user id = "+currentUserId)
      //console.log("before add, we have "+LocationsList.find({}).count())
      LocationsList.insert({
          name: locationNameVar,
          createdBy: currentUserId
      });
      //console.log("after add, we have "+LocationsList.find({}).count())
    },
    'removeLocationData': function(selectedLocation){
      var currentUserId = Meteor.userId();
      LocationsList.remove({_id: selectedLocation, createdBy: currentUserId});
    },
    });

}