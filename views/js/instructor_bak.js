var App = blocks.Application();

var Product = App.Model({
  name: App.Property(),

  editing: blocks.observable(false),

  toggleEdit: function () {
    var self = this;
    if(this.editing()){
      $.ajax({
        url: "/ChangeTopic",
        method: "PUT",
        data: {
          oldtopic: self.oldtopic,
          newtopic: self.name
        }
      })
      .done(function(data){
        console.log("updated topic" + data.topics.length == 0 ? data.topics[0]:" is none");
        GLOBAL.topics = data.topics;
      })
    }
    else {
      self["oldtopic"] = self.name;
    }
    this.editing(!this.editing());
  },

  remove: function () {
    this.destroy(true);
  }
});

var Products = App.Collection(Product);

var topics = GLOBAL.topics;
App.View('Products', {
  newProduct: Product(),

  products: Products([{ name: 'HTML' }, { name: 'CSS' }, { name: 'JavaScript' }]),

  keydown: function (e) {
    if (e.which == 13) {
      this.products.add(this.newProduct);
      this.newProduct.reset();
    }
  }
});