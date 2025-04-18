const Listing = require("../models/listing");


module.exports.index = async (req, res) => {
    const allListings = await Listing.find({})
    res.render("listings/index.ejs", { allListings });

};


module.exports.show = async (req, res) => {
        const { id } = req.params;
        const listing = await Listing.findById(id).populate({
            path:"reviews",
            populate:{
            path:"author"
        }}).populate("owner");
        console.log(listing)
        if (!listing) {
            req.flash("error", "Listing Not Found!");
            res.redirect("/listings");
        }
        res.render("listings/show.ejs", { listing,mapApiKey: process.env.MAP_API_KEY  });
    };

module.exports.newRoute = (req, res) => {
    console.log(req.user);
    res.render("listings/new.ejs");
}

module.exports.addNewListing = async(req, res, next) => {
        let url = req.file.path;
        let filename = req.file.filename;
        console.log(url, "..", filename);
        let listing = new Listing(req.body.listing);
        listing.owner = req.user._id;
        listing.image = {url, filename};
        await listing.save();
        req.flash("success", "Listing Created Successfully");
        res.redirect("/listings");

}

module.exports.editRoute = async(req, res) => {
        const { id } = req.params;
        const listing = await Listing.findById(id);
        let originalImageUrl = listing.image.url;
        originalImageUrl = originalImageUrl.replace("/upload","/upload/w_200")
        if (!listing) {
            req.flash("error", "Listing Not Found!");
            res.redirect("/listings");
        }
        res.render("listings/edit.ejs", { listing,originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
        // if(!req.body.listing){
        //     throw new ExpressError(400,"Bad Request");
        // };
        const { id } = req.params;
        let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});
        if(typeof req.file != "undefined"){
            let url = req.file.path;
            let filename = req.file.filename;;
            listing.image = {url,filename};
            await listing.save();
        };
        req.flash("success", "Listing Updated Succcessfully!");
        res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    const { id } = req.params;
    req.flash("success", "Listing deleted Succcessfully!");
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");

};