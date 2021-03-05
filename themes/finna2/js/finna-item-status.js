/*global VuFind, finna */
finna.itemStatus = (function finnaItemStatus() {
  function init() {
    $(document).on('change', '.dedup-select', function onChangeDedupSelection() {
      var select = $(this);
      var id = select.val();
      var source = select.find('option:selected').data('source');
      finna.common.setCookie('preferredRecordSource', source);

      var recordContainer = select.closest('.record-container');
      recordContainer.data('ajaxAvailabilityDone', 0);
      var oldRecordId = recordContainer.find('.hiddenId')[0].value;

      // Update IDs of elements
      recordContainer.find('.hiddenId').val(id);

      // Update IDs of elements
      recordContainer.find('[id="' + oldRecordId + '"]').each(function updateElemId() {
        select.attr('id', id);
      });

      // Update links as well
      recordContainer.find('a').each(function updateLinks() {
        var btn = select;
        if (typeof btn.attr('href') !== 'undefined') {
          btn.attr('href', btn.attr('href').replace(oldRecordId, id));
        }
      });

      // Item statuses
      var $loading = $('<span/>')
        .addClass('location ajax-availability hidden')
        .html('<i class="fa fa-spinner fa-spin"></i> ' + VuFind.translate('loading') + '...<br>');
      recordContainer.find('.callnumAndLocation')
        .empty()
        .append($loading);
      recordContainer.find('.callnumber').removeClass('hidden');
      recordContainer.find('.location').removeClass('hidden');
      recordContainer.removeClass('js-item-done');
      VuFind.itemStatuses.checkRecord(recordContainer);
    });
  }

  var my = {
    init: init
  };

  return my;
})();
