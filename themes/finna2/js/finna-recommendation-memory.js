/* global finna */
finna.recommendationMemory = (function finnaRecommendationMemory() {
  var PARAMETER_NAME = 'rmKey';
  function b64EncodeUnicode(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function replacer(match, p1) {
      return String.fromCharCode(parseInt(p1, 16));
    }));
  }

  function getDataString(srcMod, rec, orig, recType) {
    var data = {
      'srcMod': srcMod,
      'rec': rec,
      'orig': orig,
      'recType': recType
    };
    return b64EncodeUnicode(JSON.stringify(data));
  }

  function init () {
    $(document).on('click', '.ontology-recommendation a', function onClickRecommendation() {
      var btn = $(this);
      var parent = btn.parents('#ontology-recommendations');
      var key = parent.data('search-id') + '-' + btn.data('index');
      var rec = btn.text();
      var orig = parent.data('lookfor');
      var recType = btn.parents('.result-type').data('result-type');
      var value = getDataString('Ontology', rec, orig, recType);
      finna.common.setCookie(key, value);
      btn.attr(
        'href', 
        btn.attr('href') + '&' + PARAMETER_NAME + '=' + key
      );
    });
  }

  var my = {
    getDataString: getDataString,
    init: init
  };

  return my;
})();
