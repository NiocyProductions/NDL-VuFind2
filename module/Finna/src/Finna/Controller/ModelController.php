<?php

namespace Finna\Controller;

use VuFind\Cover\CachingProxy;
use VuFind\Cover\Loader;
use VuFind\Session\Settings as SessionSettings;

class ModelController extends \Laminas\Mvc\Controller\AbstractActionController
{
    protected $datasourceConfig;

    protected $recordLoader;

    protected $proxy;

    protected $sessionSettings = null;

    public function __construct(CachingProxy $proxy,
        SessionSettings $ss, \Laminas\Config\Config $datasources,
        \VuFind\Record\Loader $recordLoader
    ) {
        $this->proxy = $proxy;
        $this->sessionSettings = $ss;
        $this->datasourceConfig = $datasources;
        $this->recordLoader = $recordLoader;
    }

    public function showAction()
    {
        $this->sessionSettings->disableWrite(); // avoid session write timing bug

        $params = $this->params();
        
        $this->loader->setParams($width, $height, $size);

        // Cover image configuration for current datasource
        $recordId = $params->fromQuery('recordid');
        $datasourceId = strtok($recordId, '.');
        $datasourceCovers
            = isset($this->datasourceConfig->$datasourceId->coverimages)
                ? $this->datasourceConfig->$datasourceId->coverimages
                : null;
        $this->loader->setDatasourceConfig($datasourceCovers);

        if ($id = $params->fromQuery('id')) {
            $driver = $this->recordLoader->load($id, 'Solr');
            $index = $params->fromQuery('index');
            $this->loader->loadRecordImage($driver, $index, $size);
            $response = parent::displayImage();
        } else {
            // Redirect book covers to VuFind's cover controller
            $response = parent::showAction();
        }

        // Add a filename to the headers so that saving an image defaults to a
        // sensible filename
        if ($response instanceof \Laminas\Http\PhpEnvironment\Response) {
            $headers = $response->getHeaders();
            $contentType = $headers->get('Content-Type');
            if ($contentType && $contentType->match('image/jpeg')) {
                $params = $this->getImageParams();
                if (!empty($params['isbn'])) {
                    $filename = $params['isbn'];
                } elseif (!empty($params['issn'])) {
                    $filename = $params['issn'];
                } elseif (isset($driver)) {
                    if ($isbn = $driver->tryMethod('getCleanISBN')) {
                        $filename = $isbn;
                    } elseif ($issn = $driver->tryMethod('getCleanISSN')) {
                        $filename = $issn;
                    } else {
                        // Strip the data source prefix
                        $parts = explode('.', $driver->getUniqueID(), 2);
                        $filename = end($parts);
                        // Remove beginning of the url from filename by exploding
                        // it by %2F. Assign last part of it to the filename
                        $parts = explode('%2F', $filename);
                        $filename = end($parts);
                    }
                } elseif (!empty($params['title'])) {
                    $filename = $params['title'];
                }
                if (isset($filename)) {
                    // Remove any existing extension
                    $filename = preg_replace('/\.jpe?g/', '', $filename);
                    // Replace some characters for cleaner filenames and hopefully
                    // something that can be found with the search
                    $filename = preg_replace('/[^\w_ -]/', '_', $filename);
                    $filename .= '.jpg';
                    $headers->addHeaderLine(
                        'Content-Disposition', "inline; filename=$filename"
                    );
                }
            }
        }
        return $response;
    }

    /**
     * Convert image parameters into an array for use by the image loader.
     *
     * @return array
     */
    protected function getImageParams()
    {
        $params = parent::getImageParams();
        $params['invalid_isbn'] =  $this->params()->fromQuery('invisbn');
        return $params;
    }
}
