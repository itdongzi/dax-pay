package org.dromara.daxpay.channel.alipay.strategy.merchant;

import org.dromara.daxpay.channel.alipay.entity.AliPayConfig;
import org.dromara.daxpay.channel.alipay.service.close.AliPayCloseService;
import org.dromara.daxpay.channel.alipay.service.config.AlipayConfigService;
import org.dromara.daxpay.core.enums.ChannelEnum;
import org.dromara.daxpay.core.enums.CloseTypeEnum;
import org.dromara.daxpay.service.strategy.AbsPayCloseStrategy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * 支付宝支付订单关闭
 * @author xxm
 * @since 2023/12/30
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AlipayCloseStrategy extends AbsPayCloseStrategy {
    private final AlipayConfigService alipayConfigService;

    private final AliPayCloseService aliPayCloseService;

    private AliPayConfig alipayConfig;

    @Override
    public String getChannel() {
        return ChannelEnum.ALIPAY.getCode();
    }

    /**
     * 关闭前的处理方式
     */
    @Override
    public void doBeforeCloseHandler() {
        this.alipayConfig = alipayConfigService.getAndCheckConfig(false);
    }

    /**
     * 关闭操作
     */
    @Override
    public CloseTypeEnum doCloseHandler() {
        if (this.isUseCancel()){
            aliPayCloseService.cancel(this.getOrder(), this.alipayConfig);
            return CloseTypeEnum.CANCEL;
        } else {
            aliPayCloseService.close(this.getOrder(), this.alipayConfig);
            return CloseTypeEnum.CLOSE;
        }
    }
}
