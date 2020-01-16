<?php

namespace Finna\AjaxHandler;

use VuFind\Cache\Manager as CacheManager;
use VuFind\I18n\Translator\TranslatorAwareInterface;
use VuFind\Record\Loader;
use VuFind\Session\Settings as SessionSettings;
use Zend\Config\Config;
use Zend\Mvc\Controller\Plugin\Params;
use Zend\View\Renderer\RendererInterface;

class GetModel extends \VuFind\AjaxHandler\AbstractBase
    implements \VuFindHttp\HttpServiceAwareInterface
{
    use \VuFindHttp\HttpServiceAwareTrait;

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

    /**
     * Constructor
     */
    public function __construct(
        SessionSettings $ss, CacheManager $cm,
        Config $config, Loader $loader, RendererInterface $renderer
    ) {
        $this->sessionSettings = $ss;
        $this->cacheManager = $cm;
        $this->config = $config;
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
        $modelType = $params->fromPost('ext', $params->fromQuery('ext'));

        if (!$id || !$modelType) {
            return $this->formatResponse(['json' => ['error' => 'status']]);
            //return json_encode(['status' => self::STATUS_HTTP_BAD_REQUEST]);
        }

        $cacheDir = $this->cacheManager->getCache('model')->getOptions()
            ->getCacheDir();

        $localFile = "$cacheDir/" . urlencode($id) . urlencode($modelType);

        $maxAge = isset($this->config->Content->summarycachetime)
            ? $this->config->Content->summarycachetime : 1440;

        if (file_exists($localFile)) {
            return $this->formatResponse(['json' => ['url' => $localFile]]);
        } else {
            return $this->formatResponse(['json' => ['status' => 'not exists']]);
        }

        if (true) {
            // Get URL
            $driver = $this->recordLoader->load($id, 'Solr');
            $url = $driver->getDescriptionURL();
            // Get, manipulate, save and display content if available
            if ($url) {
                $result = $this->httpService->get($url, [], 60);
                if ($result->isSuccess() && ($content = $result->getBody())) {
                    $encoding = mb_detect_encoding(
                        $content, ['UTF-8', 'ISO-8859-1']
                    );
                    if ('UTF-8' !== $encoding) {
                        $content = utf8_encode($content);
                    }
                    // Remove head tag, so no titles will be printed.
                    $content = preg_replace(
                        '/<head[^>]*>(.*?)<\/head>/si',
                        '',
                        $content
                    );

                    $content = preg_replace('/.*<.B>(.*)/', '\1', $content);
                    $content = strip_tags($content, '<br>');

                    // Trim leading and trailing whitespace
                    $content = trim($content);

                    // Replace line breaks with <br>
                    $content = preg_replace(
                        '/(\r\n|\n|\r){3,}/', '<br><br>', $content
                    );

                    file_put_contents($localFile, $content);

                    return $this->formatResponse(['html' => $content]);
                }
            }
            $language = $this->translator->getLocale();
            if ($summary = $driver->getSummary($language)) {
                $summary = implode("\n\n", $summary);

                // Replace double hash with a <br>
                $summary = str_replace('##', "\n\n", $summary);

                // Process markdown
                $summary = $this->renderer->plugin('markdown')->toHtml($summary);

                return $this->formatResponse(['html' => $summary]);
            }
        }
        return $this->formatResponse(['html' => '']);
    }
}