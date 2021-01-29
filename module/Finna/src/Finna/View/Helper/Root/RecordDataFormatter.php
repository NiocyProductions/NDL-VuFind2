<?php
/**
 * Record driver data formatting view helper
 *
 * PHP version 7
 *
 * Copyright (C) Villanova University 2016.
 * Copyright (C) The National Library of Finland 2017.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 2,
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 *
 * @category VuFind
 * @package  View_Helpers
 * @author   Demian Katz <demian.katz@villanova.edu>
 * @author   Konsta Raunio <konsta.raunio@helsinki.fi>
 * @license  http://opensource.org/licenses/gpl-2.0.php GNU General Public License
 * @link     https://vufind.org/wiki/development:architecture:record_data_formatter
 * Wiki
 */
namespace Finna\View\Helper\Root;

use Finna\View\Helper\Root\RecordDataFormatter\FieldGroupBuilder;
use VuFind\RecordDriver\AbstractBase as RecordDriver;

/**
 * Record driver data formatting view helper
 *
 * @category VuFind
 * @package  View_Helpers
 * @author   Demian Katz <demian.katz@villanova.edu>
 * @author   Konsta Raunio <konsta.raunio@helsinki.fi>
 * @license  http://opensource.org/licenses/gpl-2.0.php GNU General Public License
 * @link     https://vufind.org/wiki/development:architecture:record_data_formatter
 * Wiki
 */
class RecordDataFormatter extends \VuFind\View\Helper\Root\RecordDataFormatter
{
    /**
     * Filter unnecessary fields from Marc records.
     *
     * @param array $coreFields data to filter.
     *
     * @return array
     */
    public function filterMarcFields($coreFields)
    {
        $include = [
            'Genre', 'Age Limit', 'New Title',
            'Previous Title', 'Secondary Authors', 'Description FWD',
            'Projected Publication Date', 'Dissertation Note', 'Other Links',
            'Presenters', 'Other Titles', 'Physical Description',
            'Language', 'original_work_language', 'Item Description',
            'Subject Detail', 'Subject Place', 'Subject Date',
            'Subject Actor', 'Collection', 'Content Description',
            'Item History', 'Inventory ID', 'Measurements',
            'Inscriptions', 'Other Classification', 'Other ID',
            'Events', 'Unit ID', 'Unit IDs',
            'Publisher', 'Series', 'Classification',
            'subjects_extended', 'Publications', 'Other Classifications',
            'Manufacturer', 'Production', 'Production Costs',
            'Funding', 'Distribution', 'Premiere Night',
            'Premiere Theaters', 'Broadcasting Dates', 'Film Festivals',
            'Foreign Distribution', 'Film Copies', 'Other Screenings',
            'Exterior Images', 'Interior Images', 'Studios',
            'Filming Location Notes', 'Filming Date', 'Archive Films',
            'Additional Information', 'child_records', 'Record Links',
            'Publish date', 'Keywords', 'Education Programs',
            'Educational Role', 'Educational Use', 'Educational Level',
            'Educational Subject', 'Learning Resource Type', 'Objective and Content',
            'Accessibility Feature', 'Accessibility Hazard', 'Publication Frequency',
            'Playing Time', 'Color', 'Sound',
            'Aspect Ratio', 'System Format', 'Audience',
            'Awards', 'Production Credits', 'Bibliography',
            'ISBN', 'ISSN', 'DOI',
            'Related Items', 'Access', 'Access Restrictions Extended',
            'Terms of Use', 'Finding Aid', 'Publication_Place',
            'Author Notes', 'Location', 'Date',
            'Source of Acquisition', 'Medium of Performance', 'Notated Music Format',
            'Event Notice', 'First Lyrics', 'Trade Availability Note',
            'Methodology', 'Inspection Details', 'Scale',
            'Available Online', 'Notes', 'Place of Origin',
            'Related Places', 'Time Period of Creation', 'Uniform Title',
            'Standard Codes', 'Publisher or Distributor Number', 'Time Period',
            'Copyright Notes', 'Language Notes', 'Uncontrolled Title'
        ];

        return array_intersect_key($coreFields, array_flip($include));
    }

    /**
     * Filter unnecessary fields from Lido records.
     *
     * @param array $coreFields data to filter.
     *
     * @return array
     */
    public function filterLidoFields($coreFields)
    {
        $include = [
            'Genre', 'Age Limit', 'Published in',
            'New Title', 'Previous Title', 'Secondary Authors',
            'Description FWD', 'Projected Publication Date', 'Dissertation Note',
            'Other Links', 'Presenters', 'Format',
            'Archive Origination', 'Archive Series', 'Physical Description',
            'Language', 'original_work_language', 'Item Description',
            'Subject Detail', 'Subject Place', 'Subject Date',
            'Subject Actor', 'Organisation', 'Collection',
            'Content Description', 'Item History', 'Inventory ID',
            'Measurements', 'Inscriptions', 'Other Classification',
            'Other ID', 'Events', 'Unit IDs',
            'Edition', 'Series', 'Classification',
            'Subjects', 'subjects_extended', 'Publications',
            'Other Classifications', 'Manufacturer', 'Production',
            'Production Costs', 'Funding', 'Distribution',
            'Premiere Night', 'Premiere Theaters', 'Broadcasting Dates',
            'Film Festivals', 'Foreign Distribution', 'Film Copies',
            'Other Screenings', 'Exterior Images', 'Interior Images',
            'Studios', 'Filming Location Notes', 'Filming Date',
            'Archive Films', 'Additional Information', 'child_records',
            'Record Links', 'Keywords', 'Education Programs',
            'Educational Role', 'Educational Use', 'Educational Level',
            'Educational Subject', 'Learning Resource Type', 'Objective and Content',
            'Accessibility Feature', 'Accessibility Hazard', 'Publication Frequency',
            'Playing Time', 'Color', 'Sound',
            'Aspect Ratio', 'System Format', 'Audience',
            'Awards', 'Production Credits', 'Bibliography',
            'ISBN', 'ISSN', 'DOI',
            'Related Items', 'Access Restrictions Extended', 'Terms of Use',
            'Finding Aid', 'Publication_Place', 'Author Notes',
            'Location', 'Date', 'Source of Acquisition',
            'Medium of Performance', 'Notated Music Format', 'Event Notice',
            'First Lyrics', 'Trade Availability Note', 'Methodology',
            'Inspection Details', 'Scale', 'Available Online',
            'Notes', 'Place of Origin', 'Related Places',
            'Time Period of Creation', 'Uniform Title', 'Standard Codes',
            'Publisher or Distributor Number', 'Time Period', 'Copyright Notes',
            'Language Notes', 'Uncontrolled Title'
        ];

        return array_intersect_key($coreFields, array_flip($include));
    }

    /**
     * Filter unnecessary fields from QDC records.
     *
     * @param array $coreFields data to filter.
     *
     * @return array
     */
    public function filterQDCFields($coreFields)
    {
        $include = [
            'Genre', 'Age Limit', 'Published in',
            'New Title', 'Previous Title', 'Secondary Authors',
            'Description FWD', 'Projected Publication Date', 'Dissertation Note',
            'Other Links', 'Presenters', 'Other Titles',
            'Archive Origination', 'Archive Series', 'Physical Description',
            'Language', 'original_work_language', 'Item Description',
            'Subject Detail', 'Subject Place', 'Subject Date',
            'Subject Actor', 'Collection', 'Content Description',
            'Item History', 'Inventory ID', 'Measurements',
            'Inscriptions', 'Other Classification', 'Other ID',
            'Events', 'Unit ID', 'Unit IDs',
            'Edition', 'Series', 'Classification',
            'Subjects', 'subjects_extended', 'Publications',
            'Other Classifications', 'Manufacturer', 'Production',
            'Production Costs', 'Funding', 'Distribution',
            'Premiere Night', 'Premiere Theaters', 'Broadcasting Dates',
            'Film Festivals', 'Foreign Distribution', 'Film Copies',
            'Other Screenings', 'Exterior Images', 'Interior Images',
            'Studios', 'Filming Location Notes', 'Filming Date',
            'Archive Films', 'Additional Information', 'child_records',
            'Record Links', 'Keywords', 'Education Programs',
            'Educational Role', 'Educational Use', 'Educational Level',
            'Educational Subject', 'Learning Resource Type', 'Objective and Content',
            'Accessibility Feature', 'Accessibility Hazard', 'Publication Frequency',
            'Playing Time', 'Color', 'Sound',
            'Aspect Ratio', 'System Format', 'Audience',
            'Awards', 'Production Credits', 'Bibliography',
            'ISSN', 'DOI', 'Related Items',
            'Access', 'Access Restrictions Extended', 'Terms of Use',
            'Finding Aid', 'Publication_Place', 'Author Notes',
            'Location', 'Date', 'Source of Acquisition',
            'Medium of Performance', 'Notated Music Format', 'Event Notice',
            'First Lyrics', 'Trade Availability Note', 'Methodology',
            'Inspection Details', 'Scale', 'Available Online',
            'Notes', 'Place of Origin', 'Related Places',
            'Time Period of Creation', 'Uniform Title', 'Standard Codes',
            'Publisher or Distributor Number', 'Time Period', 'Copyright Notes',
            'Language Notes', 'Uncontrolled Title'
        ];

        return array_intersect_key($coreFields, array_flip($include));
    }

    /**
     * Filter unnecessary fields from Lrmi records
     *
     * @param array $coreFields data to filter
     *
     * @return array
     */
    public function filterLrmiFields($coreFields)
    {
        $include = [
            'Genre', 'Age Limit', 'Original Work',
            'Published in', 'New Title', 'Previous Title',
            'Secondary Authors', 'Item Description FWD', 'Press Reviews',
            'Music', 'Projected Publication Date', 'Dissertation Note',
            'Other Links', 'Presenters', 'Other Titles',
            'Archive Origination', 'Archive Series', 'Physical Description',
            'Extent', 'Language', 'original_work_language',
            'Subject Detail', 'Subject Place', 'Subject Date',
            'Subject Actor', 'Collection', 'Item History',
            'Inventory ID', 'Measurements', 'Inscriptions',
            'Other Classification', 'Other ID', 'Events',
            'Unit ID', 'Unit IDs', 'Edition',
            'Series', 'Classification', 'Subjects',
            'subjects_extended', 'Publications', 'Other Classifications',
            'Manufacturer', 'Production', 'Production Costs',
            'Funding', 'Distribution', 'Premiere Night',
            'Premiere Theaters', 'Broadcasting Dates', 'Film Festivals',
            'Foreign Distribution', 'Film Copies', 'Other Screenings',
            'Exterior Images', 'Interior Images', 'Studios',
            'Filming Location Notes', 'Filming Date', 'Archive Films',
            'Additional Information', 'child_records', 'Record Links',
            'Online Access', 'Keywords', 'Education Programs',
            'Educational Role', 'Educational Use', 'Educational Level',
            'Educational Subject', 'Learning Resource Type', 'Objective and Content',
            'Accessibility Feature', 'Accessibility Hazard', 'Publication Frequency',
            'Playing Time', 'Color', 'Sound',
            'Aspect Ratio', 'System Format', 'Audience',
            'Awards', 'Production Credits', 'Bibliography',
            'ISBN', 'ISSN', 'DOI',
            'Related Items', 'Access Restrictions', 'Access',
            'Access Restrictions Extended', 'Terms of Use', 'Finding Aid',
            'Publication_Place', 'Author Notes', 'Location',
            'Date', 'Source of Acquisition', 'Medium of Performance',
            'Notated Music Format', 'Event Notice', 'First Lyrics',
            'Trade Availability Note', 'Methodology', 'Inspection Details',
            'Scale', 'Available Online', 'Notes',
            'Place of Origin', 'Related Places', 'Time Period of Creation',
            'Uniform Title', 'Standard Codes', 'Publisher or Distributor Number',
            'Time Period', 'Copyright Notes', 'Language Notes',
            'Uncontrolled Title'
        ];

        return array_intersect_key($coreFields, array_flip($include));
    }

    /**
     * Filter unnecessary fields from EAD records.
     *
     * @param array $coreFields data to filter.
     *
     * @return array
     */
    public function filterEADFields($coreFields)
    {
        $include = [
            'Genre', 'Age Limit', 'Original Work',
            'New Title', 'Previous Title', 'Secondary Authors',
            'Description FWD', 'Press Reviews', 'Music',
            'Projected Publication Date', 'Dissertation Note', 'Other Links',
            'Presenters', 'Other Titles', 'Format',
            'Archive Origination', 'Archive', 'Archive Series',
            'Extent', 'Language', 'original_work_language',
            'Item Description', 'Subject Detail', 'Subject Place',
            'Subject Date', 'Subject Actor', 'Collection',
            'Content Description', 'Item History', 'Measurements',
            'Inscriptions', 'Other Classification', 'Other ID',
            'Events', 'Unit ID', 'Unit IDs',
            'Authors', 'Publisher', 'Edition',
            'Classification', 'Subjects', 'subjects_extended',
            'Publications', 'Other Classifications', 'Manufacturer',
            'Production', 'Production Costs', 'Funding',
            'Distribution', 'Premiere Night', 'Premiere Theaters',
            'Broadcasting Dates', 'Film Festivals', 'Foreign Distribution',
            'Film Copies', 'Other Screenings', 'Exterior Images',
            'Interior Images', 'Studios', 'Filming Location Notes',
            'Filming Date', 'Archive Films', 'Additional Information',
            'child_records', 'Record Links', 'Publish date',
            'Keywords', 'Education Programs', 'Educational Role',
            'Educational Use', 'Educational Level', 'Educational Subject',
            'Learning Resource Type', 'Objective and Content',
            'Accessibility Feature', 'Accessibility Hazard',
            'Publication Frequency', 'Playing Time',
            'Color', 'Sound', 'Aspect Ratio',
            'System Format', 'Audience', 'Awards',
            'Production Credits', 'Bibliography', 'ISBN',
            'ISSN', 'DOI', 'Related Items',
            'Access Restrictions', 'Access Restrictions Extended', 'Terms of Use',
            'Finding Aid', 'Publication_Place', 'Author Notes',
            'Location', 'Date', 'Source of Acquisition',
            'Medium of Performance', 'Notated Music Format', 'Event Notice',
            'First Lyrics', 'Trade Availability Note', 'Methodology',
            'Inspection Details', 'Scale', 'Available Online',
            'Notes', 'Place of Origin', 'Related Places',
            'Time Period of Creation', 'Uniform Title', 'Standard Codes',
            'Publisher or Distributor Number', 'Time Period', 'Copyright Notes',
            'Language Notes', 'Uncontrolled Title'
        ];

        return array_intersect_key($coreFields, array_flip($include));
    }

    /**
     * Filter unnecessary fields from EAD records.
     *
     * @param array $coreFields data to filter.
     *
     * @return array
     */
    public function filterEAD3Fields($coreFields)
    {
        $include = [
            'Genre', 'Age Limit', 'Original Work',
            'New Title', 'Previous Title', 'Secondary Authors',
            'Description FWD', 'Press Reviews', 'Music',
            'Projected Publication Date', 'Dissertation Note', 'Other Links',
            'Presenters', 'Other Titles', 'Format',
            'Archive Origination', 'Archive', 'Archive Series',
            'Extent', 'Language', 'original_work_language',
            'Item Description', 'Subject Detail', 'Subject Place',
            'Subject Date', 'Subject Actor', 'Collection',
            'Content Description', 'Item History', 'Measurements',
            'Inscriptions', 'Other Classification', 'Other ID',
            'Events', 'Unit IDs', 'Publisher',
            'Edition', 'Classification', 'Subjects',
            'subjects_extended', 'Publications', 'Other Classifications',
            'Manufacturer', 'Production', 'Production Costs',
            'Funding', 'Distribution', 'Premiere Night',
            'Premiere Theaters', 'Broadcasting Dates', 'Film Festivals',
            'Foreign Distribution', 'Film Copies', 'Other Screenings',
            'Exterior Images', 'Interior Images', 'Studios',
            'Filming Location Notes', 'Filming Date', 'Archive Films',
            'Additional Information', 'child_records', 'Record Links',
            'Publish date', 'Keywords', 'Education Programs',
            'Educational Role', 'Educational Use', 'Educational Level',
            'Educational Subject', 'Learning Resource Type', 'Objective and Content',
            'Accessibility Feature', 'Accessibility Hazard', 'Publication Frequency',
            'Playing Time', 'Color', 'Sound',
            'Aspect Ratio', 'System Format', 'Audience',
            'Awards', 'Production Credits', 'Bibliography',
            'ISBN', 'ISSN', 'DOI',
            'Related Items', 'Access Restrictions Extended', 'Terms of Use',
            'Finding Aid', 'Publication_Place', 'Author Notes',
            'Location', 'Date', 'Source of Acquisition',
            'Medium of Performance', 'Notated Music Format', 'Event Notice',
            'First Lyrics', 'Trade Availability Note', 'Methodology',
            'Inspection Details', 'Scale', 'Available Online',
            'Notes', 'Place of Origin', 'Related Places',
            'Time Period of Creation', 'Uniform Title', 'Standard Codes',
            'Publisher or Distributor Number', 'Time Period', 'Copyright Notes',
            'Language Notes', 'Uncontrolled Title', 'Archive Relations'
        ];

        return array_intersect_key($coreFields, array_flip($include));
    }

    /**
     * Filter unnecessary fields from Primo records.
     *
     * @param array $coreFields data to filter.
     *
     * @return array
     */
    public function filterPrimoFields($coreFields)
    {
        $include = [
            'Genre', 'Age Limit', 'Original Work',
            'New Title', 'Previous Title', 'Secondary Authors',
            'Description FWD', 'Press Reviews', 'Music',
            'Projected Publication Date', 'Dissertation Note', 'Other Links',
            'Presenters', 'Other Titles', 'Archive Origination',
            'Archive Series', 'Physical Description', 'Language',
            'original_work_language', 'Item Description', 'Subject Detail',
            'Subject Place', 'Subject Date', 'Subject Actor',
            'Collection', 'Content Description', 'Item History',
            'Inventory ID', 'Measurements', 'Inscriptions',
            'Other Classification', 'Other ID', 'Events',
            'Unit ID', 'Unit IDs', 'Authors',
            'Edition', 'Series', 'Classification',
            'Subjects', 'subjects_extended', 'Publications',
            'Other Classifications', 'Manufacturer', 'Production',
            'Production Costs', 'Funding', 'Distribution',
            'Premiere Night', 'Premiere Theaters', 'Broadcasting Dates',
            'Film Festivals', 'Foreign Distribution', 'Film Copies',
            'Other Screenings', 'Exterior Images', 'Interior Images',
            'Studios', 'Filming Location Notes', 'Filming Date',
            'Archive Films', 'Additional Information', 'child_records',
            'Record Links', 'Source Collection', 'Publish date',
            'Keywords', 'Education Programs', 'Educational Role',
            'Educational Use', 'Educational Level', 'Educational Subject',
            'Learning Resource Type', 'Objective and Content',
            'Accessibility Feature', 'Accessibility Hazard',
            'Publication Frequency', 'Playing Time',
            'Color', 'Sound', 'Aspect Ratio',
            'System Format', 'Audience', 'Awards',
            'Production Credits', 'Bibliography', 'ISBN',
            'ISSN', 'DOI', 'Related Items',
            'Access', 'Access Restrictions Extended', 'Terms of Use',
            'Finding Aid', 'Publication_Place', 'Author Notes',
            'Location', 'Date', 'Source of Acquisition',
            'Medium of Performance', 'Notated Music Format', 'Event Notice',
            'First Lyrics', 'Trade Availability Note', 'Methodology',
            'Inspection Details', 'Scale', 'Available Online',
            'Notes', 'Place of Origin', 'Related Places',
            'Time Period of Creation', 'Uniform Title', 'Standard Codes',
            'Publisher or Distributor Number', 'Time Period', 'Copyright Notes',
            'Language Notes', 'Uncontrolled Title'
        ];

        return array_intersect_key($coreFields, array_flip($include));
    }

    /**
     * Filter unnecessary fields from Forward records.
     *
     * @param array $coreFields data to filter.
     *
     * @return array
     */
    public function filterForwardFields($coreFields)
    {
        $include = [
            'Genre', 'Age Limit', 'Original Work',
            'New Title', 'Previous Title', 'Secondary Authors',
            'Actors', 'Item Description FWD', 'Description FWD',
            'Press Reviews', 'Music', 'Projected Publication Date',
            'Dissertation Note', 'Other Links', 'Archive Origination',
            'Archive Series', 'Physical Description', 'Language',
            'original_work_language', 'Subject Detail', 'Subject Place',
            'Subject Date', 'Subject Actor', 'Collection',
            'Content Description', 'Item History', 'Inventory ID',
            'Measurements', 'Inscriptions', 'Other Classification',
            'Other ID', 'Events', 'Unit ID',
            'Unit IDs', 'Published', 'Series',
            'Classification', 'Subjects', 'subjects_extended',
            'Publications', 'Other Classifications', 'Manufacturer',
            'Production', 'Production Costs', 'Funding',
            'Distribution', 'Premiere Night', 'Premiere Theaters',
            'Broadcasting Dates', 'Film Festivals', 'Foreign Distribution',
            'Film Copies', 'Other Screenings', 'Exterior Images',
            'Interior Images', 'Studios', 'Filming Location Notes',
            'Filming Date', 'Archive Films', 'Additional Information',
            'child_records', 'Record Links', 'Online Access',
            'Publish date', 'Keywords', 'Education Programs',
            'Educational Role', 'Educational Use', 'Educational Level',
            'Educational Subject', 'Learning Resource Type', 'Objective and Content',
            'Accessibility Feature', 'Accessibility Hazard', 'Publication Frequency',
            'Playing Time', 'Color', 'Sound',
            'Aspect Ratio', 'System Format', 'Audience',
            'Awards', 'Production Credits', 'Bibliography',
            'ISBN', 'ISSN', 'DOI',
            'Related Items', 'Access', 'Access Restrictions Extended',
            'Terms of Use', 'Finding Aid', 'Publication_Place',
            'Author Notes', 'Location', 'Date',
            'Source of Acquisition', 'Medium of Performance', 'Notated Music Format',
            'Event Notice', 'First Lyrics', 'Trade Availability Note',
            'Methodology', 'Inspection Details', 'Scale',
            'Available Online', 'Notes', 'Place of Origin',
            'Related Places', 'Time Period of Creation', 'Uniform Title',
            'Standard Codes', 'Publisher or Distributor Number', 'Time Period',
            'Copyright Notes', 'Language Notes', 'Uncontrolled Title'
        ];

        return array_intersect_key($coreFields, array_flip($include));
    }

    /**
     * Filter unnecessary fields from EAD-collection records.
     *
     * @param array  $coreFields data to filter.
     * @param string $type       Collection type (ead|ead3)
     *
     * @return array
     */
    public function filterCollectionFields($coreFields, $type = 'ead')
    {
        $include = [
            'Genre', 'Age Limit', 'Original Work',
            'New Title', 'Previous Title', 'Secondary Authors',
            'Actors', 'Description FWD', 'Press Reviews',
            'Music', 'Projected Publication Date', 'Dissertation Note',
            'Other Links', 'Presenters', 'Other Titles',
            'Archive Origination', 'Archive', 'Archive Series',
            'Extent', 'Language', 'original_work_language',
            'Item Description', 'Subject Detail', 'Subject Place',
            'Subject Date', 'Subject Actor', 'Organisation',
            'Collection', 'Content Description', 'Item History',
            'Inventory ID', 'Measurements', 'Inscriptions',
            'Other Classification', 'Other ID', 'Events',
            'Unit ID', 'Unit IDs', 'Authors',
            'Publisher', 'Edition', 'Series',
            'Classification', 'Subjects', 'subjects_extended',
            'Publications', 'Other Classifications', 'Manufacturer',
            'Production', 'Production Costs', 'Funding',
            'Distribution', 'Premiere Night', 'Premiere Theaters',
            'Broadcasting Dates', 'Film Festivals', 'Foreign Distribution',
            'Film Copies', 'Other Screenings', 'Exterior Images',
            'Interior Images', 'Studios', 'Filming Location Notes',
            'Filming Date', 'Archive Films', 'Additional Information',
            'child_records', 'Record Links', 'Publish date',
            'Keywords', 'Education Programs', 'Educational Role',
            'Educational Use', 'Educational Level', 'Educational Subject',
            'Learning Resource Type', 'Objective and Content',
            'Accessibility Feature', 'Accessibility Hazard',
            'Publication Frequency', 'Playing Time',
            'Color', 'Sound', 'Aspect Ratio',
            'System Format', 'Audience', 'Awards',
            'Production Credits', 'Bibliography', 'ISBN',
            'ISSN', 'DOI', 'Related Items',
            'Access Restrictions', 'Access Restrictions Extended', 'Terms of Use',
            'Finding Aid', 'Publication_Place', 'Author Notes',
            'Location', 'Date', 'Source of Acquisition',
            'Medium of Performance', 'Notated Music Format', 'Event Notice',
            'First Lyrics', 'Trade Availability Note', 'Methodology',
            'Inspection Details', 'Scale', 'Available Online',
            'Notes', 'Place of Origin', 'Related Places',
            'Time Period of Creation', 'Uniform Title', 'Standard Codes',
            'Publisher or Distributor Number', 'Time Period', 'Copyright Notes',
            'Language Notes', 'Uncontrolled Title'
        ];

        $fields = array_intersect_key($coreFields, array_flip($include));

        return $type === 'ead' ?
            $this->filterEADFields($fields) :
            $this->filterEAD3Fields($fields);
    }

    /**
     * Helper method for getting a spec of field groups.
     *
     * @param array  $groups        Array specifying the groups.
     * @param array  $lines         All lines used in the groups.
     * @param string $template      Default group template to use if not
     *                              specified (optional).
     * @param array  $options       Additional options to use if not specified
     *                              for a group (optional).
     * @param array  $unusedOptions Additional options for unused lines
     *                              (optional).
     *
     * @return array
     */
    public function getGroupedFields($groups, $lines,
        $template = 'core-field-group-fields.phtml', $options = [],
        $unusedOptions = []
    ) {
        $fieldGroups = new FieldGroupBuilder();
        $fieldGroups->setGroups(
            $groups, $lines, $template, $options, $unusedOptions
        );
        return $fieldGroups->getArray();
    }

    /**
     * Create formatted key/value data based on a record driver and grouped
     * field spec.
     *
     * @param RecordDriver $driver Record driver object.
     * @param array        $groups Grouped formatting specification.
     *
     * @return array
     *
     * @throws \Exception
     */
    public function getGroupedData(RecordDriver $driver, array $groups)
    {
        // Apply the group spec.
        $result = [];
        foreach ($groups as $group) {
            $lines = $group['lines'];
            $data = $this->getData($driver, $lines);
            if (empty($data)) {
                continue;
            }
            // Render the fields in the group as the value for the group.
            $value = $this->renderRecordDriverTemplate(
                $driver, $data, ['template' => $group['template']]
            );
            $result[] = [
                'label' => $group['label'],
                'value' => $value,
                'context' => $group['context'],
            ];
        }
        return $result;
    }
}
