<?php

namespace Finna\AjaxHandler;

use VuFind\Cache\Manager as CacheManager;
use VuFind\I18n\Translator\TranslatorAwareInterface;
use VuFind\Record\Loader;
use VuFind\Session\Settings as SessionSettings;
use Laminas\Config\Config;
use Laminas\Mvc\Controller\Plugin\Params;
use Laminas\View\Renderer\RendererInterface;
use Laminas\Http\Request;
use Laminas\View\Helper\ServerUrl;

class GetModel extends \VuFind\AjaxHandler\AbstractBase
    implements \VuFindHttp\HttpServiceAwareInterface
{
    use \VuFindHttp\HttpServiceAwareTrait;

    protected $sessionSettings;

    /**
     * Cache manager
     *
     * @var CacheManager
     */
    protected $cacheManager;

    /**
     * Config
     *
     * @var Config
     */
    protected $config;

    //Recordloader
    protected $loader;

    protected $urlHelper;

    protected $router;

    protected $domainUrl;
    /**
     * Constructor
     */
    public function __construct(
        SessionSettings $ss, CacheManager $cm,
        Config $config, Loader $loader, \Laminas\Router\Http\TreeRouteStack $router,
        string $domainUrl
    ) {
        $this->sessionSettings = $ss;
        $this->cacheManager = $cm;
        $this->config = $config;
        $this->recordLoader = $loader;
        $this->router = $router;
        $this->domainUrl = $domainUrl;
    }

    /**
     * Handle a request.
     *
     * @param Params $params Parameter helper from controller
     *
     * @return array [response data, HTTP status code]
     */
    public function handleRequest(Params $params)
    {
        $this->disableSessionWrites();  // avoid session write timing bug

        $id = $params->fromPost('id', $params->fromQuery('id'));

        if (!$id) {
            return json_encode(['status' => self::STATUS_HTTP_BAD_REQUEST]);
        }

        $cacheDir = $this->cacheManager->getCache('public')->getOptions()
            ->getCacheDir();
        $fileName = urlencode($id) . '.glb';
        $localFile = "$cacheDir/$fileName";

        // Check if the model has been cached
        if (!file_exists($localFile)) {
            $driver = $this->recordLoader->load($id, 'Solr');
            $data = $driver->getModelData();
            if (!$data) {
                return $this->formatResponse(['json' => ['status' => 'Error']]);
            }
            $url = $data['preview_model'] ?? '';
            if (empty($url)) {
                return $this->formatResponse(['json' => ['status' => 'Error']]);
            }
            // Load the file from a server
            $file = file_get_contents($url);
            if (!$file) {
                return $this->formatResponse(['json' => ['status' => 'Error']]);
            }
            // Save the file to a local cache for future usage
            $save = file_put_contents($localFile, $file);
            if (!$save) {
                return $this->formatResponse(['json' => ['status' => 'Error']]);
            }
        }
        $route = stripslashes($this->router->getBaseUrl());
        // We need to alter the url to point towards the cache file, now its just an absolute path
        // Url for public cache is located in domainurl/cache so lets point there, but
        // For this demo we are going to 
        $url = "{$this->domainUrl}{$route}/cache/$fileName";

        return $this->formatResponse(['url' => $url]);
    }
}