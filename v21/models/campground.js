var mongoose = require("mongoose");

var campgroundSchema = new mongoose.Schema({
   name: String,
   price: Number,
   image: String,
   imageId: String,
   description: String,
   location: String,
   lat: Number,
   lng: Number,
   createdAt: { type: Date, default: Date.now },
   author: {
      id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User",
      },
      username: String ,
   },
   comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"
      }
   ],
   reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    rating: {
        type: Number,
        default: 0
    },
});

// REMOVE ALL COMMENTS INSAID THE CAMPGROUND
/*const Comment = require('./comment');
campgroundSchema.pre('remove', async function() {
	await Comment.remove({
		_id: {
			$in: this.comments
		}
	});
});*/

module.exports = mongoose.model("Campground", campgroundSchema);

