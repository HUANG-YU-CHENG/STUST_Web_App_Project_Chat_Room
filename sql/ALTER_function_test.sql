ALTER TABLE rooms
    ALTER COLUMN invite_code SET NOT NULL,
    ADD CONSTRAINT rooms_invite_code_key UNIQUE (invite_code);
/*
改名TABLE方法
除了改名以外，還可以使用ALTER TABLE來修改表格的結構，例如新增欄位、刪除欄位、修改欄位型別等等。
ALTER TABLE語法的基本格式如下：
    ALTER TABLE table_name -- 指定要修改的表格名稱
    ADD column_name datatype; -- 新增欄位
    ALTER COLUMN column_name datatype; -- 修改欄位型別
    DROP COLUMN column_name; -- 刪除欄位
*/