package org.dromara.daxpay.single.sdk.param.channel;

import lombok.Data;
import lombok.experimental.Accessors;
import org.dromara.daxpay.single.sdk.param.ChannelParam;

/**
 * 支付宝支付参数
 * @author xxm
 * @since 2021/2/27
 */
@Data
@Accessors(chain = true)
public class AlipayParam implements ChannelParam {


    /**
     * 【描述】小程序支付中，商户实际经营主体的小程序应用的appid，也即最终唤起收银台支付所在的小程序的应用id
     * 【注意事项】商户需要先在产品管理中心绑定该小程序appid，否则下单会失败
     */
    private String opAppId;

    /**
     * 买家支付宝用户唯一标识
     */
    private String openId;


    /**
     * 买家支付宝用户ID
     * 新商户建议使用buyer_open_id替代该字段。对于新商户，buyer_id字段未来计划逐步回收，存量商户可继续使用
     */
    private String buyerId;

}
