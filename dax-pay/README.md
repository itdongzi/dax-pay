# DaxPay 支付网关系统

<p align="center">
	<img src="_doc/images/dax-pay.svg" width="45%">
</p>

<p align="center">
 <img src="https://img.shields.io/badge/Dax%20Pay-3.0.0-success.svg" alt="Build Status"/>
 <img src="https://img.shields.io/badge/Spring%20Boot-3.4.3-blue.svg" alt="Downloads"/>
 <img src="https://img.shields.io/badge/license-Apache%20License%202.0-green.svg"/>
</p>

## 📖 项目介绍

DaxPay 是一个现代化的支付网关系统，采用 Apache License 2.0 协议开源。本系统致力于为各类业务系统提供统一的支付接入解决方案，支持多种主流支付渠道，包括但不限于支付宝、微信支付、云闪付等。系统设计注重易用性、安全性和可扩展性，能够满足各类业务场景的支付需求。

## 🌟 核心特性

### 1. 统一支付接口
- 标准化支付接口，一次接入，多渠道支持
- 支持多种支付方式：微信支付、支付宝、云闪付等
- 多应用配置支持，可同时对接多个支付渠道账号
- 统一的支付回调处理机制

### 2. 支付功能
- 支付：支持多种支付方式，包括扫码支付、H5支付、小程序支付等
- 退款：完整的退款流程支持，包括全额退款和部分退款
- 对账：自动对账功能，支持多渠道对账
- 分账：支持商户分账，灵活的资金分配方案
- 支付通知：可靠的消息通知机制

### 3. 系统集成
- 提供 RESTful HTTP 接口
- 提供 Java SDK，支持快速集成
- 完善的签名验证机制，确保交易安全
- 提供完整的管理后台，支持可视化配置
- 支持多租户部署

## 🛠️ 技术架构

### 后端技术栈
- JDK 21+
- Spring Boot 3.3.x
- Redis 5.x+
- MySQL 8.x+ / PostgreSQL 10+
- Maven
- MyBatis-Plus
- Spring Security
- JWT 认证

### 前端技术栈
- Vue 3.x
- Element Plus
- Vite
- TypeScript
- Pinia 状态管理

## 🚀 快速开始

### 环境要求
- JDK 21+
- Redis 5.x+
- MySQL 8.x+ / PostgreSQL 10+
- Maven 3.6+
- Node.js 16+

### 部署方式

#### 1. Docker 部署（推荐）
```bash
# 克隆项目
git clone https://github.com/itdongzi/dax-pay.git

# 进入项目目录
cd dax-pay

# 使用 docker-compose 启动
docker-compose up -d
```

#### 2. 手动部署
1. 克隆项目
2. 配置数据库（执行 SQL 脚本）
3. 修改配置文件（application.yml）
4. 编译打包
5. 运行服务

### 配置说明
主要配置项包括：
- 数据库连接配置
- Redis 连接配置
- 支付渠道配置
- 系统安全配置
- 日志配置
- 通知配置

## 📚 详细文档

- [快速指南](docs/guides/overview/项目介绍.md)
- [支付对接文档](docs/gateway/overview/接口清单.md)
- [操作手册](docs/admin/config/平台配置.md)
- [开发文档](docs/development/overview/开发指南.md)
- [常见问题](docs/faq/overview/常见问题.md)

## 💻 系统演示

### 管理平台
- 演示地址：https://single.web.daxpay.cn
- 默认账号：daxpay
- 默认密码：daxpay123

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进项目。

## 📄 开源协议

本项目采用 [Apache License 2.0](LICENSE) 协议开源，使用前请仔细阅读[用户授权使用协议](用户授权使用协议.txt)。

## 🙏 鸣谢

感谢以下开源项目：
- Spring Boot 团队提供的优秀框架
- Vue.js 团队提供的优秀前端框架
- 其他提供灵感和思路的开源项目

## 📝 更新日志

[查看历史更新记录](docs/Changelog.md)

## 🗺️ 开发计划

[查看当前开发进度和任务池](docs/Task.md)

## 🔒 安全说明

如果您发现任何安全漏洞，请通过以下方式联系我们：
- 提交 Issue
- 发送邮件至：您的邮箱地址

## 📞 技术支持

如果您在使用过程中遇到任何问题，可以通过以下方式获取帮助：
- 查看[常见问题](docs/faq/overview/常见问题.md)
- 提交 Issue
- 发送邮件至：您的邮箱地址
