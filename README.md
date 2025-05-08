# 部署运行
## 安装必要的软件
### 安装 Python 3.8.5
检查是否已安装 Python：
```bash
python3 --version
```
如果未安装，执行以下命令：
```bash
sudo apt update
sudo apt install -y python3.8 python3.8-venv python3.8-dev
```
### 安装 MySQL
检查是否已安装 MySQL：
```bash
mysql --version
```
如果未安装，执行以下命令：
```bash
sudo apt update
sudo apt install -y mysql-server
```
### 安装nodejs
```bash
sudo apt install -y nodejs
```
### 安装npm
```bash
sudo apt install -y npm
```
## 数据库配置
启动 MySQL 服务
```bash
sudo systemctl start mysql
sudo systemctl enable mysql
```
登录 MySQL：
```bash
mysql -u root -p
```
创建数据库和用户：
```sql
CREATE DATABASE recs;
CREATE USER 'admin'@'localhost' IDENTIFIED BY '5KP6eHGt4nkwW748';
GRANT ALL PRIVILEGES ON recs.* TO 'admin'@'localhost';
FLUSH PRIVILEGES;
```
切换到 recs 数据库并创建表：
```sql
USE recs;
CREATE TABLE rec(
    id BIGINT PRIMARY KEY,
    record_date DATETIME,
    location VARCHAR(100),
    weather JSON,
    air JSON
);
```
退出 MySQL：
```bash
exit
```
## 后端部署
代码在smog-back目录下
创建虚拟环境
```bash
python3.8 -m venv venv
```
激活虚拟环境：
```bash
source venv/bin/activate
```
安装必要的 Python 库：
```bash
pip install flask flask-cors pymysql
```
启动后端服务
```bash
python app.py
```
## 前端部署
代码在smog-front目录下

安装依赖
```bash
npm install
```
启动前端服务
```bash
npm run dev
```