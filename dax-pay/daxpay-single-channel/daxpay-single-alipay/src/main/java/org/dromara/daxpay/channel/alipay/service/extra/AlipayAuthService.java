package org.dromara.daxpay.channel.alipay.service.extra;

import cn.bootx.platform.core.exception.BizException;
import org.dromara.daxpay.channel.alipay.entity.AliPayConfig;
import org.dromara.daxpay.channel.alipay.service.config.AlipayConfigService;
import org.dromara.daxpay.core.param.assist.GenerateAuthUrlParam;
import org.dromara.daxpay.core.result.assist.AuthResult;
import org.dromara.daxpay.core.result.assist.AuthUrlResult;
import org.dromara.daxpay.service.entity.config.PlatformConfig;
import org.dromara.daxpay.service.service.config.PlatformConfigService;
import cn.hutool.core.util.RandomUtil;
import cn.hutool.core.util.StrUtil;
import com.alipay.api.request.AlipaySystemOauthTokenRequest;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * 支付宝认证服务类
 * @author xxm
 * @since 2024/6/16
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AlipayAuthService {

    private final AlipayConfigService aliPayConfigService;

    private final PlatformConfigService platformsConfigService;

    /**
     * 生成一个用于授权页面的链接
     * 1. 如果手动传输授权回调地址, 不进行处理
     * 2. 如果未手动传输授权回调地址, 使用系统默认的授权页地址, 返回授权页地址和用于查询的标识码
     */
    public AuthUrlResult generateAuthUrl(GenerateAuthUrlParam param, AliPayConfig aliPayConfig) {
        // 如果手动传输, 直接返回空, 因为支付宝OpenId方式不用通过回调获取
        if (StrUtil.isAllNotBlank(param.getAuthRedirectUrl())){
            return new AuthUrlResult();
        } else {
            PlatformConfig platformConfig = platformsConfigService.getConfig();
            String queryCode = RandomUtil.randomString(10);

            String serverUrl = platformConfig.getGatewayMobileUrl();
            String authUrl = StrUtil.format("{}/auth/alipay/{}/{}/{}/{}",
                    serverUrl, param.getAppId(), param.getChannel(), queryCode, aliPayConfig.getAliAppId());

            return new AuthUrlResult().setAuthUrl(authUrl).setQueryCode(queryCode);
        }
    }

    /**
     * 获取OpenId或者userid用户标识
     */
    @SneakyThrows
    public AuthResult getOpenIdOrUserId(String authCode, AliPayConfig aliPayConfig) {
        // 初始化SDK
        // 构造请求参数以调用接口
        AlipaySystemOauthTokenRequest request = new AlipaySystemOauthTokenRequest();
        // 设置授权码
        request.setCode(authCode);
        // 设置授权方式
        request.setGrantType("authorization_code");
        var response = aliPayConfigService.execute(request,aliPayConfig);
        if (!response.isSuccess()) {
            log.warn("获取支付宝OpenId失败,原因:{}", response.getSubMsg());
            throw new BizException("获取支付宝OpenId失败");
        }
        var result = new AuthResult();
        // 如果未申请 OpenId 方式, 则获取的是UserId
        if (StrUtil.isBlank(response.getOpenId())) {
            return result.setUserId(response.getUserId());
        }
        return result.setOpenId(response.getOpenId());
    }
}
