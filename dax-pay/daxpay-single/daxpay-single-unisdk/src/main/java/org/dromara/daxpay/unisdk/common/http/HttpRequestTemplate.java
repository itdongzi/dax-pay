package org.dromara.daxpay.unisdk.common.http;

import cn.hutool.core.util.StrUtil;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.apache.http.Header;
import org.apache.http.HttpHost;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.client.CredentialsProvider;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.config.Registry;
import org.apache.http.config.RegistryBuilder;
import org.apache.http.conn.socket.ConnectionSocketFactory;
import org.apache.http.conn.socket.PlainConnectionSocketFactory;
import org.apache.http.conn.ssl.DefaultHostnameVerifier;
import org.apache.http.conn.ssl.SSLConnectionSocketFactory;
import org.apache.http.impl.client.BasicCredentialsProvider;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.impl.conn.PoolingHttpClientConnectionManager;
import org.apache.http.ssl.SSLContexts;
import org.dromara.daxpay.unisdk.common.bean.MethodType;
import org.dromara.daxpay.unisdk.common.bean.result.PayException;
import org.dromara.daxpay.unisdk.common.exception.PayErrorException;

import javax.net.ssl.KeyManagerFactory;
import javax.net.ssl.SSLContext;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.security.GeneralSecurityException;
import java.security.KeyStore;
import java.security.NoSuchAlgorithmException;
import java.util.Map;

/**
 * http请求工具
 *
 * @author egan
 * <code>
 * email egzosn@gmail.com <br>
 * date 2017/3/3 21:33
 * </code>
 */
@Slf4j
public class HttpRequestTemplate {

    protected CloseableHttpClient httpClient;

    protected PoolingHttpClientConnectionManager connectionManager;

    /**
     * -- GETTER --
     *  获取代理带代理地址的 HttpHost
     *
     * @return 获取代理带代理地址的 HttpHost
     */
    @Getter
    protected HttpHost httpProxy;

    protected HttpConfigStorage configStorage;

    private SSLConnectionSocketFactory sslsf;

    public CloseableHttpClient getHttpClient() {
        if (null != httpClient) {
            return httpClient;
        }
        if (null == configStorage) {
            return httpClient = HttpClients.createDefault();
        }

        CloseableHttpClient httpClient = HttpClients
                .custom()
                //网络提供者
                .setDefaultCredentialsProvider(createCredentialsProvider(configStorage))
                .setConnectionManager(connectionManager(configStorage))
                //设置httpclient的SSLSocketFactory
                .setSSLSocketFactory(createSSL(configStorage))
                .setDefaultRequestConfig(createRequestConfig(configStorage))
                .build();
        if (null == connectionManager) {
            return this.httpClient = httpClient;
        }

        return httpClient;

    }

    private RequestConfig createRequestConfig(HttpConfigStorage configStorage) {
        // .setConnectionRequestTimeout(1000)
        return RequestConfig.custom()
                .setSocketTimeout(configStorage.getSocketTimeout())
                .setConnectTimeout(configStorage.getConnectTimeout())
// .setConnectionRequestTimeout(1000)
                .build();
    }

    /**
     * 初始化
     *
     * @param configStorage 请求配置
     */
    public HttpRequestTemplate(HttpConfigStorage configStorage) {
        setHttpConfigStorage(configStorage);
    }

    public HttpRequestTemplate() {
        setHttpConfigStorage(null);
    }


    /**
     * 创建ssl配置
     *
     * @param configStorage 请求配置
     * @return SSLConnectionSocketFactory  Layered socket factory for TLS/SSL connections.
     */
    public SSLConnectionSocketFactory createSSL(HttpConfigStorage configStorage) {
        if (null != sslsf) {
            return sslsf;
        }
        if (null == configStorage.getKeystore()) {
            try {
                return sslsf = new SSLConnectionSocketFactory(SSLContext.getDefault());
            }
            catch (NoSuchAlgorithmException e) {
                log.error("", e);
            }
        }

        //读取本机存放的PKCS12证书文件
        try (InputStream instream = configStorage.getKeystoreInputStream()) {
            //指定读取证书格式为PKCS12
            KeyStore keyStore = KeyStore.getInstance("PKCS12");

            char[] password = configStorage.getStorePassword().toCharArray();
            //指定PKCS12的密码
            keyStore.load(instream, password);
            // 实例化密钥库 & 初始化密钥工厂
            KeyManagerFactory kmf = KeyManagerFactory.getInstance(KeyManagerFactory.getDefaultAlgorithm());
            kmf.init(keyStore, password);
            // 创建 SSLContext
            SSLContext sslcontext = SSLContexts.custom()
                    .loadKeyMaterial(keyStore, password).build();

            //指定TLS版本
            sslsf = new SSLConnectionSocketFactory(
                    sslcontext, new String[]{"TLSv1", "TLSv1.2"}, null,
                    new DefaultHostnameVerifier());

            return sslsf;
        }
        catch (IOException | GeneralSecurityException e) {
            log.error("", e);
        }
        return null;

    }

    /**
     * 创建凭据提供程序
     *
     * @param configStorage 请求配置
     * @return 凭据提供程序
     */
    public CredentialsProvider createCredentialsProvider(HttpConfigStorage configStorage) {


        if (StrUtil.isBlank(configStorage.getAuthUsername())) {
            return null;
        }

        // 需要用户认证的代理服务器
        CredentialsProvider credsProvider = new BasicCredentialsProvider();
        credsProvider.setCredentials(
                AuthScope.ANY,
                new UsernamePasswordCredentials(configStorage.getAuthUsername(), configStorage.getAuthPassword()));


        return credsProvider;
    }

    /**
     * 初始化连接池
     *
     * @param configStorage 配置
     * @return 连接池对象
     */
    public PoolingHttpClientConnectionManager connectionManager(HttpConfigStorage configStorage) {
        if (null != connectionManager) {
            return connectionManager;
        }
        if (0 == configStorage.getMaxTotal() || 0 == configStorage.getDefaultMaxPerRoute()) {
            return null;
        }
        if (log.isInfoEnabled()) {
            log.info("Initialize the PoolingHttpClientConnectionManager -- maxTotal:{}, defaultMaxPerRoute:{}", configStorage.getMaxTotal(), configStorage.getDefaultMaxPerRoute());
        }
        Registry<ConnectionSocketFactory> socketFactoryRegistry = RegistryBuilder.<ConnectionSocketFactory>create()
                .register("https", createSSL(configStorage))
                .register("http", new PlainConnectionSocketFactory())
                .build();
        connectionManager = new PoolingHttpClientConnectionManager(socketFactoryRegistry);
        connectionManager.setMaxTotal(configStorage.getMaxTotal());
        connectionManager.setDefaultMaxPerRoute(configStorage.getDefaultMaxPerRoute());

        return connectionManager;
    }

    /**
     * 设置HTTP请求的配置
     *
     * @param configStorage 请求配置
     * @return 当前HTTP请求的客户端模板
     */
    public HttpRequestTemplate setHttpConfigStorage(HttpConfigStorage configStorage) {
        this.configStorage = configStorage;

        if (null != configStorage && StrUtil.isNotBlank(configStorage.getHttpProxyHost())) {
            //http代理地址设置
            httpProxy = new HttpHost(configStorage.getHttpProxyHost(), configStorage.getHttpProxyPort());
            ;
        }

        return this;
    }


    /**
     * post
     *
     * @param uri          请求地址
     * @param request      请求参数
     * @param responseType 为响应类(需要自己依据响应格式来确定)
     * @param uriVariables 地址通配符对应的值
     * @param <T>          响应类型
     * @return 类型对象
     */
    public <T> T postForObject(String uri, Object request, Class<T> responseType, Object... uriVariables) {
        return doExecute(URI.create(UriVariables.getUri(uri, uriVariables)), request, responseType, MethodType.POST);
    }

    public <T> T postForObject(String uri, Object request, Class<T> responseType, Map<String, Object> uriVariables) {
        return doExecute(URI.create(UriVariables.getUri(uri, uriVariables)), request, responseType, MethodType.POST);
    }

    public <T> T postForObject(URI uri, Object request, Class<T> responseType) {
        return doExecute(uri, request, responseType, MethodType.POST);
    }


    /**
     * get 请求
     *
     * @param uri          请求地址
     * @param responseType 响应类型
     * @param uriVariables 用于匹配表达式
     * @param <T>          响应类型
     * @return 类型对象
     *
     * <code>
     * getForObject(&quot;http://egan.in/pay/{id}/f/{type}&quot;, String.class, &quot;1&quot;, &quot;APP&quot;)
     * </code>
     */
    public <T> T getForObject(String uri, Class<T> responseType, Object... uriVariables) {

        return doExecute(URI.create(UriVariables.getUri(uri, uriVariables)), null, responseType, MethodType.GET);
    }

    /**
     * get 请求
     *
     * @param uri          请求地址
     * @param responseType 响应类型
     * @param uriVariables 用于匹配表达式
     * @param <T>          响应类型
     * @return 类型对象
     * <code>
     * Map&lt;String, String&gt; uriVariables = new HashMap&lt;String, String&gt;();<br>
     *
     * uriVariables.put(&quot;id&quot;, &quot;1&quot;);<br>
     *
     * uriVariables.put(&quot;type&quot;, &quot;APP&quot;);<br>
     *
     * getForObject(&quot;http://egan.in/pay/{id}/f/{type}&quot;, String.class, uriVariables)<br>
     * </code>
     */
    public <T> T getForObject(String uri, Class<T> responseType, Map<String, ?> uriVariables) {
        return doExecute(URI.create(UriVariables.getUri(uri, uriVariables)), null, responseType, MethodType.GET);
    }


    /**
     * get 请求
     *
     * @param uri          请求地址
     * @param header       请求头
     * @param responseType 响应类型
     * @param uriVariables 用于匹配表达式
     * @param <T>          响应类型
     * @return 类型对象
     *
     * <code>
     * getForObject(&quot;http://egan.in/pay/{id}/f/{type}&quot;, String.class, &quot;1&quot;, &quot;APP&quot;)
     * </code>
     */
    public <T> T getForObject(String uri, HttpHeader header, Class<T> responseType, Object... uriVariables) {

        return getForObjectEntity(uri, header, responseType, uriVariables).getBody();
    }

    /**
     * get 请求
     *
     * @param uri          请求地址
     * @param header       请求头
     * @param responseType 响应类型
     * @param uriVariables 用于匹配表达式
     * @param <T>          响应类型
     * @return 类型对象
     *
     * <code>
     * getForObject(&quot;http://egan.in/pay/{id}/f/{type}&quot;, String.class, &quot;1&quot;, &quot;APP&quot;)
     * </code>
     */
    public <T> ResponseEntity<T> getForObjectEntity(String uri, HttpHeader header, Class<T> responseType, Object... uriVariables) {

        return doExecuteEntity(URI.create(UriVariables.getUri(uri, uriVariables)), header, responseType, MethodType.GET);
    }

    /**
     * get 请求
     *
     * @param uri          请求地址
     * @param responseType 响应类型
     * @param uriVariables 用于匹配表达式
     * @param <T>          响应类型
     * @return 类型对象
     *
     * <code>
     * getForObject(&quot;http://egan.in/pay/{id}/f/{type}&quot;, String.class, &quot;1&quot;, &quot;APP&quot;)
     * </code>
     */
    public <T> ResponseEntity<T> getForObjectEntity(String uri, Class<T> responseType, Object... uriVariables) {

        return doExecuteEntity(URI.create(UriVariables.getUri(uri, uriVariables)), null, responseType, MethodType.GET);
    }

    /**
     * get 请求
     *
     * @param uri          请求地址
     * @param header       请求头
     * @param responseType 响应类型
     * @param uriVariables 用于匹配表达式
     * @param <T>          响应类型
     * @return 类型对象
     * <code>
     * Map&lt;String, String&gt; uriVariables = new HashMap&lt;String, String&gt;();<br>
     *
     * uriVariables.put(&quot;id&quot;, &quot;1&quot;);<br>
     *
     * uriVariables.put(&quot;type&quot;, &quot;APP&quot;);<br>
     *
     * getForObject(&quot;http://egan.in/pay/{id}/f/{type}&quot;, String.class, uriVariables)<br>
     * </code>
     */
    public <T> T getForObject(String uri, HttpHeader header, Class<T> responseType, Map<String, ?> uriVariables) {
        return getForObjectEntity(uri, header, responseType, uriVariables).getBody();
    }

    /**
     * get 请求
     *
     * @param uri          请求地址
     * @param header       请求头
     * @param responseType 响应类型
     * @param uriVariables 用于匹配表达式
     * @param <T>          响应类型
     * @return 类型对象
     * <code>
     * Map&lt;String, String&gt; uriVariables = new HashMap&lt;String, String&gt;();<br>
     *
     * uriVariables.put(&quot;id&quot;, &quot;1&quot;);<br>
     *
     * uriVariables.put(&quot;type&quot;, &quot;APP&quot;);<br>
     *
     * getForObject(&quot;http://egan.in/pay/{id}/f/{type}&quot;, String.class, uriVariables)<br>
     * </code>
     */
    public <T> ResponseEntity<T> getForObjectEntity(String uri, HttpHeader header, Class<T> responseType, Map<String, ?> uriVariables) {
        return doExecuteEntity(URI.create(UriVariables.getUri(uri, uriVariables)), header, responseType, MethodType.GET);
    }


    /**
     * http 请求执行
     *
     * @param uri          地址
     * @param request      请求数据
     * @param responseType 响应类型
     * @param method       请求方法
     * @param <T>          响应类型
     * @return 类型对象
     */
    public <T> T doExecute(URI uri, Object request, Class<T> responseType, MethodType method) {
        return doExecuteEntity(uri, request, responseType, method).getBody();

    }

    /**
     * http 请求执行
     *
     * @param uri          地址
     * @param request      请求数据
     * @param responseType 响应类型
     * @param method       请求方法
     * @param <T>          响应类型
     * @return 类型对象
     */
    public <T> ResponseEntity<T> doExecuteEntity(URI uri, Object request, Class<T> responseType, MethodType method) {

        if (log.isDebugEnabled()) {
            log.debug("uri:{}, httpMethod:{} ", uri, method.name());
        }
        ClientHttpRequest<T> httpRequest = new ClientHttpRequest<>(uri, method, request, null == configStorage ? null : configStorage.getCharset());
        //判断是否有代理设置
        if (null != httpProxy) {
            httpRequest.setProxy(httpProxy);
        }
        httpRequest.setResponseType(responseType);
        try (CloseableHttpResponse response = getHttpClient().execute(httpRequest)) {
            int statusCode = response.getStatusLine().getStatusCode();
            Header[] allHeaders = response.getAllHeaders();
            T body = httpRequest.handleResponse(response);
            return new ResponseEntity<>(statusCode, allHeaders, body);
        }
        catch (IOException e) {
            throw new PayErrorException(new PayException("IOException", e.getLocalizedMessage()), e);
        }
        finally {
            httpRequest.releaseConnection();
        }
    }


    /**
     * http 请求执行
     *
     * @param uri          地址
     * @param request      请求数据
     * @param responseType 响应类型
     * @param method       请求方法
     * @param <T>          响应类型
     * @return 类型对象
     */
    public <T> T doExecute(String uri, Object request, Class<T> responseType, MethodType method) {
        return doExecute(URI.create(uri), request, responseType, method);
    }

    /**
     * http 请求执行
     *
     * @param uri          地址
     * @param request      请求数据
     * @param responseType 响应类型
     * @param method       请求方法
     * @param <T>          响应类型
     * @return 类型对象
     */
    public <T> ResponseEntity<T> doExecuteEntity(String uri, Object request, Class<T> responseType, MethodType method) {
        return doExecuteEntity(URI.create(uri), request, responseType, method);
    }
}
