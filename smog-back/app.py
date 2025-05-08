import pymysql
from flask import Flask, request, jsonify
from flask_cors import CORS
from time import strftime
from time import localtime
import json
from snowflake import IdWorker

IDGenerator = IdWorker(1, 1, 0)

app = Flask(__name__)
CORS(app, resources=r"/*")

sql_conn = pymysql.connect(host='localhost',   # MySQL服务器的主机地址
                       port=3306,          # 端口号
                       user='admin',        # 用户名
                       password='5KP6eHGt4nkwW748',  # 密码
                       database='recs',    # 目标数据库
                       charset='utf8mb4'   # 编码，不要加“-”，否则报错
                       )

def toJson(str_):
    res={}
    try:
        res=json.loads(str_)
    except:
        return {}
    return res

@app.route("/add_rec", methods=["POST"])
def add():
    sql_conn.ping(reconnect=True)
    record_date = strftime('%Y-%m-%d %H:%M:%S',localtime())
    id=IDGenerator.get_id()
    sql="INSERT INTO rec VALUES("+str(id)+",%s,%s,%s,%s); "
    cursor = sql_conn.cursor()
    cursor.execute(sql,(record_date,request.form["location"],request.form["weather"],request.form["air"]))
    sql_conn.commit()
    return jsonify({"success":True})

@app.route("/query_rec", methods=["GET"])
def query():
    sql_conn.ping(reconnect=True)
    cursor=sql_conn.cursor()
    sql="""
    SELECT * FROM rec;
    """
    cursor.execute(sql)
    res=cursor.fetchall()
    res_data=[{"id":str(l[0]),"record_date":str(l[1]),"location":str(l[2]),"weather":toJson(l[3]),"air":toJson(l[4])} for l in res]
    return jsonify({"res":res_data})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5590,debug=True)