<?php
/**
 * ShopAI - Web URL & E-Commerce Real Scraper API
 * Dynamically fetches and extracts metadata, prices, images, headings, and links from any URL.
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$rawUrl = trim($_GET['url'] ?? $_POST['url'] ?? '');
if (!$rawUrl) {
    $input = json_decode(file_get_contents('php://input'), true);
    $rawUrl = trim($input['url'] ?? '');
}

if (!$rawUrl) {
    echo json_encode([
        'success' => false,
        'error'   => 'Please provide a valid URL to analyze.'
    ]);
    exit;
}

// Ensure protocol is present
if (!preg_match('~^https?://~i', $rawUrl)) {
    $rawUrl = 'https://' . $rawUrl;
}

// Validate URL
if (!filter_var($rawUrl, FILTER_VALIDATE_URL)) {
    echo json_encode([
        'success' => false,
        'error'   => 'The provided URL is invalid or malformed.'
    ]);
    exit;
}

$parsedUrl = parse_url($rawUrl);
$host = $parsedUrl['host'] ?? '';
$scheme = $parsedUrl['scheme'] ?? 'https';
$baseUrl = $scheme . '://' . $host;

// Helper to resolve relative URLs to absolute URLs
function resolveUrl($relative, $base, $currentUrl) {
    $relative = trim($relative);
    if (!$relative || strpos($relative, 'javascript:') === 0 || strpos($relative, 'mailto:') === 0 || strpos($relative, 'tel:') === 0) {
        return false;
    }
    if (preg_match('~^https?://~i', $relative)) {
        return $relative;
    }
    if (strpos($relative, '//') === 0) {
        return 'https:' . $relative;
    }
    if (strpos($relative, '/') === 0) {
        return rtrim($base, '/') . $relative;
    }
    $path = parse_url($currentUrl, PHP_URL_PATH) ?? '/';
    $dir = dirname($path);
    if ($dir === '\\' || $dir === '.') $dir = '';
    return rtrim($base, '/') . ($dir ? '/' . trim($dir, '/') : '') . '/' . $relative;
}

// HTTP status code dictionary
$statusTexts = [
    200 => '200 OK',
    201 => '201 Created',
    301 => '301 Moved Permanently',
    302 => '302 Found',
    304 => '304 Not Modified',
    400 => '400 Bad Request',
    401 => '401 Unauthorized',
    403 => '403 Forbidden',
    404 => '404 Not Found',
    500 => '500 Internal Server Error',
    502 => '502 Bad Gateway',
    503 => '503 Service Unavailable'
];

// Perform cURL request
$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL            => $rawUrl,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_MAXREDIRS      => 6,
    CURLOPT_TIMEOUT        => 9,
    CURLOPT_CONNECTTIMEOUT => 4,
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_SSL_VERIFYHOST => false,
    CURLOPT_ENCODING       => '', // enables all supported encodings (gzip, deflate, etc.)
    CURLOPT_USERAGENT      => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    CURLOPT_HTTPHEADER     => [
        'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language: en-US,en;q=0.9',
        'Cache-Control: max-age=0',
        'Upgrade-Insecure-Requests: 1',
        'Sec-Ch-Ua: "Chromium";v="124", "Google Chrome";v="124"',
        'Sec-Ch-Ua-Mobile: ?0',
        'Sec-Ch-Ua-Platform: "Windows"',
        'Sec-Fetch-Dest: document',
        'Sec-Fetch-Mode: navigate',
        'Sec-Fetch-Site: none',
        'Sec-Fetch-User: ?1'
    ]
]);

$html = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$effectiveUrl = curl_getinfo($ch, CURLINFO_EFFECTIVE_URL) ?: $rawUrl;
$curlError = curl_error($ch);
curl_close($ch);

$statusString = $statusTexts[$httpCode] ?? ($httpCode ? "$httpCode Response" : "Request Timeout");

// Fallback handlers if blocked by WAF or bot detection (e.g. Google Search bot captcha or Cloudflare 403)
$isGoogle = stripos($host, 'google.') !== false;
$searchQuery = '';
if ($isGoogle && isset($parsedUrl['query'])) {
    parse_str($parsedUrl['query'], $qParams);
    if (!empty($qParams['q'])) {
        $searchQuery = $qParams['q'];
    }
}

// If cURL failed or returned empty content, provide dynamic URL-derived metadata
if (!$html || strlen($html) < 20) {
    $fallbackTitle = '';
    $fallbackDesc = '';
    if ($isGoogle && $searchQuery) {
        $fallbackTitle = "Google Search: " . htmlspecialchars($searchQuery);
        $fallbackDesc = "Google search results and query overview for '" . htmlspecialchars($searchQuery) . "'.";
    } else {
        $pathParts = array_filter(explode('/', parse_url($rawUrl, PHP_URL_PATH) ?? ''));
        $slug = end($pathParts) ?: $host;
        $fallbackTitle = ucwords(str_replace(['-', '_', '.'], ' ', $slug)) . " — " . $host;
        $fallbackDesc = "Webpage resource located on " . $host . " (" . $statusString . ").";
    }

    echo json_encode([
        'success'   => true,
        'status'    => $statusString,
        'title'     => $fallbackTitle,
        'desc'      => $fallbackDesc,
        'canonical' => $effectiveUrl,
        'price'     => 'N/A (Non-commercial page)',
        'host'      => $host,
        'images'    => [
            "https://www.google.com/s2/favicons?domain={$host}&sz=128"
        ],
        'links'     => [
            ['text' => 'Domain Homepage (' . $host . ')', 'href' => $baseUrl],
            ['text' => 'Source URL Resource', 'href' => $rawUrl]
        ],
        'headings'  => [
            ['tag' => 'H1', 'text' => $fallbackTitle],
            ['tag' => 'H2', 'text' => 'Host: ' . $host]
        ],
        'note'      => 'Server responded with ' . $statusString . ' or protected response.'
    ]);
    exit;
}

// Parse HTML using DOMDocument
libxml_use_internal_errors(true);
$dom = new DOMDocument();
// Prefix with UTF-8 XML meta to avoid encoding issues
$dom->loadHTML('<?xml encoding="UTF-8">' . $html, LIBXML_NOERROR | LIBXML_NOWARNING);
libxml_clear_errors();

$xpath = new DOMXPath($dom);

// 1. Title Extraction
$title = '';
$ogTitle = $xpath->query('//meta[@property="og:title"]/@content');
if ($ogTitle->length && trim($ogTitle->item(0)->nodeValue)) {
    $title = trim($ogTitle->item(0)->nodeValue);
} else {
    $titleNodes = $dom->getElementsByTagName('title');
    if ($titleNodes->length && trim($titleNodes->item(0)->textContent)) {
        $title = trim($titleNodes->item(0)->textContent);
    } else {
        $h1Nodes = $xpath->query('//h1');
        if ($h1Nodes->length && trim($h1Nodes->item(0)->textContent)) {
            $title = trim($h1Nodes->item(0)->textContent);
        }
    }
}
if (!$title) {
    if ($isGoogle && $searchQuery) {
        $title = "Google Search: " . htmlspecialchars($searchQuery);
    } else {
        $title = $host . " Webpage";
    }
}

// 2. Description Extraction
$desc = '';
$ogDesc = $xpath->query('//meta[@property="og:description"]/@content');
if ($ogDesc->length && trim($ogDesc->item(0)->nodeValue)) {
    $desc = trim($ogDesc->item(0)->nodeValue);
} else {
    $metaDesc = $xpath->query('//meta[@name="description"]/@content');
    if ($metaDesc->length && trim($metaDesc->item(0)->nodeValue)) {
        $desc = trim($metaDesc->item(0)->nodeValue);
    } else {
        $pNodes = $xpath->query('//p');
        foreach ($pNodes as $p) {
            $text = trim(preg_replace('/\s+/', ' ', $p->textContent));
            if (strlen($text) > 40) {
                $desc = substr($text, 0, 220) . '...';
                break;
            }
        }
    }
}
if (!$desc) {
    $desc = "Webpage content extracted from {$host} via ShopAI Automated Scraper.";
}

// 3. Canonical URL
$canonical = '';
$canonicalNode = $xpath->query('//link[@rel="canonical"]/@href');
if ($canonicalNode->length && trim($canonicalNode->item(0)->nodeValue)) {
    $canonical = resolveUrl(trim($canonicalNode->item(0)->nodeValue), $baseUrl, $effectiveUrl);
}
if (!$canonical) {
    $ogUrl = $xpath->query('//meta[@property="og:url"]/@content');
    if ($ogUrl->length && trim($ogUrl->item(0)->nodeValue)) {
        $canonical = trim($ogUrl->item(0)->nodeValue);
    } else {
        $canonical = $effectiveUrl;
    }
}

// 4. Price Detection
$price = '';
// Check OpenGraph product price
$ogPrice = $xpath->query('//meta[@property="product:price:amount"]/@content');
if ($ogPrice->length) {
    $currencyNode = $xpath->query('//meta[@property="product:price:currency"]/@content');
    $currency = $currencyNode->length ? $currencyNode->item(0)->nodeValue : '₹';
    $price = $currency . ' ' . trim($ogPrice->item(0)->nodeValue);
}

// Check JSON-LD structured data for price
if (!$price) {
    $jsonLdNodes = $xpath->query('//script[@type="application/ld+json"]');
    foreach ($jsonLdNodes as $script) {
        $json = @json_decode($script->nodeValue, true);
        if ($json) {
            // Find offers / price
            $searchOffers = function($data) use (&$searchOffers, &$price) {
                if (!is_array($data)) return;
                if (isset($data['price'])) {
                    $curr = $data['priceCurrency'] ?? '₹';
                    $price = $curr . ' ' . $data['price'];
                    return;
                }
                foreach ($data as $k => $v) {
                    if (is_array($v) && !$price) $searchOffers($v);
                }
            };
            $searchOffers($json);
            if ($price) break;
        }
    }
}

// Check if host is known informational or search platform
$isNonCommerce = preg_match('/(wikipedia\.org|google\.|bing\.com|duckduckgo\.com|yahoo\.com|github\.com|stackoverflow\.com|w3schools\.com|developer\.mozilla\.org)/i', $host);

if ($isNonCommerce) {
    $price = 'N/A (Informational / Non-commercial page)';
} else {
    // Check elements with price-related class or attribute
    $priceNodes = $xpath->query('//*[contains(@class, "price") or contains(@class, "Price") or contains(@id, "price") or contains(@data-price, "")]');
    foreach ($priceNodes as $node) {
        $nodeText = trim($node->textContent);
        if (preg_match('/(?:[\$\x{20B9}€£]|Rs\.?|INR)\s*([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{2})?)/u', $nodeText, $pm)) {
            $symbol = preg_match('/[\$\x{20B9}€£]/u', $nodeText, $sm) ? $sm[0] : '₹';
            $price = $symbol . ' ' . $pm[1];
            break;
        }
    }

    // Check common pricing regex in HTML body with UTF-8 support
    if (!$price) {
        if (preg_match('/(?:price|cost|mrp|deal)[:\s]*[\$\x{20B9}€£Rs\.]*\s*([0-9]{1,3}(?:,[0-9]{2,3})+(?:\.[0-9]{2})?)/iu', $html, $m)) {
            $price = '₹ ' . trim($m[1]);
        } elseif (preg_match('/[\$\x{20B9}€£]\s*([0-9]{1,3}(?:,[0-9]{2,3})+(?:\.[0-9]{2})?)/u', $html, $m)) {
            $price = trim($m[0]);
        }
    }
}

if (!$price) {
    $price = 'N/A (No pricing metadata found)';
}

// 5. Image Extraction
$images = [];
// First check OpenGraph image
$ogImg = $xpath->query('//meta[@property="og:image"]/@content');
if ($ogImg->length) {
    $resolved = resolveUrl($ogImg->item(0)->nodeValue, $baseUrl, $effectiveUrl);
    if ($resolved && !in_array($resolved, $images)) {
        $images[] = $resolved;
    }
}

$imgNodes = $xpath->query('//img');
foreach ($imgNodes as $img) {
    $src = $img->getAttribute('src');
    if (!$src || strpos($src, 'data:image/svg+xml') === 0 || strpos($src, 'spacer') !== false) {
        $src = $img->getAttribute('data-src') ?: $img->getAttribute('data-original') ?: $img->getAttribute('data-lazy-src');
    }
    if ($src) {
        $resolved = resolveUrl($src, $baseUrl, $effectiveUrl);
        if ($resolved && !in_array($resolved, $images) && !preg_match('/\.(svg|ico)$/i', $resolved)) {
            $images[] = $resolved;
        }
    }
    if (count($images) >= 18) break;
}

// If no images found, add site favicon/logo
if (empty($images)) {
    $favicon = $xpath->query('//link[@rel="icon" or @rel="shortcut icon"]/@href');
    if ($favicon->length) {
        $resolvedFav = resolveUrl($favicon->item(0)->nodeValue, $baseUrl, $effectiveUrl);
        if ($resolvedFav) $images[] = $resolvedFav;
    }
    if (empty($images)) {
        $images[] = "https://www.google.com/s2/favicons?domain={$host}&sz=128";
    }
}

// 6. Hyperlinks Extraction
$links = [];
$aNodes = $xpath->query('//a[@href]');
foreach ($aNodes as $a) {
    $href = trim($a->getAttribute('href'));
    $text = trim(preg_replace('/\s+/', ' ', $a->textContent));
    $resolvedHref = resolveUrl($href, $baseUrl, $effectiveUrl);
    
    if ($resolvedHref && $resolvedHref !== '#' && strpos($resolvedHref, 'javascript:') !== 0) {
        if (!$text) {
            $text = parse_url($resolvedHref, PHP_URL_PATH) ?: $resolvedHref;
        }
        $text = substr($text, 0, 80);
        $links[] = [
            'text' => $text,
            'href' => $resolvedHref
        ];
    }
    if (count($links) >= 25) break;
}

// 7. Headings Extraction (H1 to H6)
$headings = [];
$hNodes = $xpath->query('//h1 | //h2 | //h3 | //h4');
foreach ($hNodes as $h) {
    $text = trim(preg_replace('/\s+/', ' ', $h->textContent));
    if ($text && strlen($text) > 2) {
        $headings[] = [
            'tag'  => strtoupper($h->tagName),
            'text' => substr($text, 0, 120)
        ];
    }
    if (count($headings) >= 20) break;
}

// Output complete scraped JSON
echo json_encode([
    'success'   => true,
    'status'    => $statusString,
    'title'     => $title,
    'desc'      => $desc,
    'canonical' => $canonical,
    'price'     => $price,
    'host'      => $host,
    'images'    => $images,
    'links'     => $links,
    'headings'  => $headings
], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
