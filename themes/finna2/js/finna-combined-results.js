/*global VuFind, finna, checkSaveStatuses*/
finna.combinedResults = (function finnaCombinedResults() {
  var my = {
    init: function init(container) {
      finna.layout.truncateFields();
      finna.layout.initImagePaginators();
      finna.openUrl.initLinks(container);
      VuFind.itemStatuses.check(container);
      VuFind.recordVersions.init(container);
      VuFind.lightbox.bind(container);
      VuFind.cart.init(container);
      checkSaveStatuses(container);
    }
  };

  return my;
})();
