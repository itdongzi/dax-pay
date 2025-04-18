package org.dromara.daxpay.channel.union.sdk.api;

import org.dromara.daxpay.unisdk.common.api.BasePayConfigStorage;
import org.dromara.daxpay.unisdk.common.bean.CertStoreType;

import java.io.IOException;
import java.io.InputStream;


/**
 * @author Actinia
 * <pre>
 *         email hayesfu@qq.com
 *           create 2017 2017/11/4 0004
 *         </pre>
 */
public class UnionPayConfigStorage extends BasePayConfigStorage {


    /**
     * 商户号
     */
    private String merId;

    /**
     * 商户收款账号
     */
    private String seller;

    /**
     * API版本
     */
    private String version = "5.1.0";
    /**
     * 0：普通商户直连接入
     * 1： 收单机构
     * 2：平台类商户接入
     */
    private String accessType = "0";


    /**
     * 应用私钥证书
     */
    private Object keyPrivateCert;
    /**
     * 应用私钥证书，rsa_private pkcs8格式 生成签名时使用
     */
    private String keyPrivateCertPwd;

    /**
     * 中级证书
     */
    private Object acpMiddleCert;
    /**
     * 根证书
     */
    private Object acpRootCert;

    /**
     * 证书存储类型
     */
    private CertStoreType certStoreType;

    /**
     * 设置私钥证书
     *
     * @param certificate 私钥证书地址 或者证书内容字符串
     *                    私钥证书密码 {@link #setKeyPrivateCertPwd(String)}
     */
    public void setKeyPrivateCert(String certificate) {
        super.setKeyPrivate(certificate);
        this.keyPrivateCert = certificate;
    }

    /**
     * 设置私钥证书
     *
     * @param keyPrivateCert 私钥证书信息流
     *                       私钥证书密码 {@link #setKeyPrivateCertPwd(String)}
     */
    public void setKeyPrivateCert(InputStream keyPrivateCert) {
        this.keyPrivateCert = keyPrivateCert;
    }

    public InputStream getKeyPrivateCertInputStream() throws IOException {
        return certStoreType.getInputStream(keyPrivateCert);
    }

    /**
     * 设置中级证书
     *
     * @param acpMiddleCert 证书信息或者证书路径
     */
    public void setAcpMiddleCert(String acpMiddleCert) {
        this.acpMiddleCert = acpMiddleCert;
    }

    /**
     * 设置中级证书
     *
     * @param acpMiddleCert 证书文件
     */
    public void setAcpMiddleCert(InputStream acpMiddleCert) {
        this.acpMiddleCert = acpMiddleCert;
    }

    /**
     * 设置根证书
     *
     * @param acpRootCert 证书路径或者证书信息字符串
     */
    public void setAcpRootCert(String acpRootCert) {
        this.acpRootCert = acpRootCert;
    }

    /**
     * 设置根证书
     *
     * @param acpRootCert 证书文件流
     */
    public void setAcpRootCert(InputStream acpRootCert) {
        this.acpRootCert = acpRootCert;
    }

    public String getAcpMiddleCert() {
        return (String) acpMiddleCert;
    }

    public String getAcpRootCert() {
        return (String) acpRootCert;
    }

    public InputStream getAcpMiddleCertInputStream() throws IOException {
        return certStoreType.getInputStream(acpMiddleCert);
    }

    public InputStream getAcpRootCertInputStream() throws IOException {
        return certStoreType.getInputStream(acpRootCert);
    }

    /**
     * 获取私钥证书密码
     *
     * @return 私钥证书密码
     */
    public String getKeyPrivateCertPwd() {
        return keyPrivateCertPwd;
    }

    public void setKeyPrivateCertPwd(String keyPrivateCertPwd) {
        this.keyPrivateCertPwd = keyPrivateCertPwd;
    }

    /**
     * 应用id
     * 纠正名称
     *
     * @return 应用id
     */
    @Override
    public String getAppId() {
        return null;
    }


    @Override
    public String getPid() {
        return merId;
    }

    public void setPid(String pid) {
        this.merId = pid;
    }

    @Override
    public String getSeller() {
        return seller;
    }

    public void setSeller(String seller) {
        this.seller = seller;
    }

    public String getMerId() {
        return merId;
    }

    public void setMerId(String merId) {
        this.merId = merId;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getAccessType() {
        return accessType;
    }

    public void setAccessType(String accessType) {
        this.accessType = accessType;
    }

    /**
     * 证书存储类型
     *
     * @return 证书存储类型
     */
    public CertStoreType getCertStoreType() {
        return certStoreType;
    }

    public void setCertStoreType(CertStoreType certStoreType) {
        this.certStoreType = certStoreType;
    }
}
