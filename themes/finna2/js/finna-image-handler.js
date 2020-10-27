/* global finna, VuFind */
finna.imageHandler = (function imageHandler() {
  var my = {
    init: function init() {
      $.fn.setPaginatorTranslations({
        image: VuFind.translate('Image'),
        close: VuFind.translate('close'),
        next: VuFind.translate('Next Record'),
        previous: VuFind.translate('Previous Record'),
        no_cover: VuFind.translate('No Cover Image')
      });
      $('.image-popup-trigger').each(function initImages() {
        var _ = $(this);
        _.one('inview', function loadWhenSeen() {
          _.finnaPaginator(_.data('settings'), _.data('images'));
        });
      });
    }
  };

  return my;
})();