-- ============================================================
-- 三下乡乡村实践地图智能体平台 — 数据库建表 SQL
-- 请在 Supabase SQL Editor 中执行此脚本
-- ============================================================

-- 1. 乡村表
CREATE TABLE IF NOT EXISTS villages (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  province    TEXT NOT NULL DEFAULT '广东省',
  city        TEXT NOT NULL,
  county      TEXT NOT NULL,
  lat         FLOAT8 NOT NULL,
  lng         FLOAT8 NOT NULL,
  visit_count INT NOT NULL DEFAULT 0,
  population  INT NOT NULL DEFAULT 0,
  description TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 2. 乡村需求表
CREATE TABLE IF NOT EXISTS village_needs (
  id          TEXT PRIMARY KEY,
  village_id  TEXT NOT NULL REFERENCES villages(id) ON DELETE CASCADE,
  category    TEXT NOT NULL CHECK (category IN (
                'education','medical','agriculture','culture',
                'environment','elderly_care','infrastructure','digital'
              )),
  title       TEXT NOT NULL,
  description TEXT DEFAULT '',
  urgency     TEXT NOT NULL DEFAULT 'medium' CHECK (urgency IN ('high','medium','low')),
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','matched','fulfilled')),
  created_at  DATE NOT NULL DEFAULT CURRENT_DATE
);

-- 3. 实践队伍表
CREATE TABLE IF NOT EXISTS teams (
  id                  TEXT PRIMARY KEY,
  name                TEXT NOT NULL,
  university          TEXT NOT NULL,
  member_count        INT NOT NULL DEFAULT 5,
  skills              TEXT[] DEFAULT '{}',
  preferred_categories TEXT[] DEFAULT '{}',
  description         TEXT DEFAULT '',
  completed_count     INT NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- 4. 匹配记录表
CREATE TABLE IF NOT EXISTS matches (
  id          SERIAL PRIMARY KEY,
  team_id     TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  village_id  TEXT NOT NULL REFERENCES villages(id) ON DELETE CASCADE,
  score       INT NOT NULL DEFAULT 0,
  reasons     TEXT[] DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 5. 需求-队伍匹配关联表
CREATE TABLE IF NOT EXISTS need_team_matches (
  village_id TEXT NOT NULL REFERENCES villages(id) ON DELETE CASCADE,
  team_id    TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  PRIMARY KEY (village_id, team_id)
);

-- ===== 索引 =====
CREATE INDEX IF NOT EXISTS idx_needs_village ON village_needs(village_id);
CREATE INDEX IF NOT EXISTS idx_needs_status ON village_needs(status);
CREATE INDEX IF NOT EXISTS idx_villages_visit ON villages(visit_count);
CREATE INDEX IF NOT EXISTS idx_matches_team ON matches(team_id);
CREATE INDEX IF NOT EXISTS idx_matches_village ON matches(village_id);

-- ============================================================
-- 种子数据：广东省 27 个行政村 + 6 支队伍
-- ============================================================

INSERT INTO villages (id, name, province, city, county, lat, lng, visit_count, population, description) VALUES
('gd_sz_01','南岭村','广东省','深圳市','龙岗区',22.5431,114.0579,26,3200,'深圳改革开放示范村，集体经济发达'),
('gd_gz_01','大源村','广东省','广州市','白云区',23.1291,113.2644,22,5800,'广州电商第一村，物流与直播产业聚集地'),
('gd_dg_01','雁田村','广东省','东莞市','凤岗镇',22.746,114.149,18,4500,'东莞制造业强村，电子信息产业聚集'),
('gd_fs_01','紫南村','广东省','佛山市','禅城区',23.0218,113.1214,16,3800,'佛山乡村振兴样板村'),
('gd_zh_01','会同村','广东省','珠海市','香洲区',22.370,113.553,15,2100,'珠海历史文化名村，产学研合作活跃'),
('gd_zs_01','崖口村','广东省','中山市','南朗镇',22.496,113.552,12,2600,'中山生态农业示范村，稻田观光与民宿产业'),
('gd_hz_01','范和村','广东省','惠州市','惠东县',22.800,114.782,10,3100,'惠州滨海古村落，渔耕文化保存完好'),
('gd_jm_01','自力村','广东省','江门市','开平市',22.313,112.588,14,1800,'世界文化遗产开平碉楼核心村落'),
('gd_zq_01','黎槎村','广东省','肇庆市','高要区',23.047,112.465,8,1500,'八卦村布局独特，岭南古建筑群保存完整'),
('gd_st_01','前美村','广东省','汕头市','澄海区',23.460,116.766,6,2800,'潮汕传统民居群保存完好'),
('gd_cz_01','龙湖古寨','广东省','潮州市','潮安区',23.657,116.623,5,2200,'潮州千年古寨，韩江畔的历史文化名村'),
('gd_jy_01','棉湖村','广东省','揭阳市','揭西县',23.450,116.123,3,3600,'揭西客家村落，传统农耕与外出务工并存'),
('gd_sw_01','新山村','广东省','汕尾市','海丰县',22.786,115.375,0,1200,'海丰革命老区村，红色资源丰富但开发不足'),
('gd_sg_01','珠玑村','广东省','韶关市','南雄市',25.117,114.335,4,1800,'珠玑古巷所在地，广府人寻根圣地'),
('gd_qy_01','上岳村','广东省','清远市','佛冈县',23.860,113.511,2,2500,'锅耳楼古建筑群，岭南特色民居代表'),
('gd_hy_01','林寨村','广东省','河源市','和平县',24.244,115.016,0,3200,'东江流域客家古村落，四角楼建筑群独特'),
('gd_mz_01','桥溪村','广东省','梅州市','梅县区',24.289,116.122,5,900,'客家古村落典范，围龙屋建筑保存完好'),
('gd_zj_01','邦塘村','广东省','湛江市','雷州市',20.910,110.085,1,2100,'雷州半岛传统村落，热带农业与海洋资源丰富'),
('gd_mm_01','八坊村','广东省','茂名市','高州市',21.920,110.870,0,2800,'茂名荔枝产区核心村，农业大村但科技化程度低'),
('gd_yj_01','大澳村','广东省','阳江市','阳东区',21.858,112.023,0,1500,'渔港古村落，海洋渔业文化与疍家民俗独特'),
('gd_yf_01','水东村','广东省','云浮市','云城区',22.915,112.045,0,1100,'云浮石文化村落，石材产业发达但环保问题突出'),
('gd_hz_02','旭日村','广东省','惠州市','博罗县',23.382,114.287,2,1300,'罗浮山脚下古村落，中草药种植传统悠久'),
('gd_jm_02','浮月村','广东省','江门市','台山市',22.083,112.732,3,1600,'台山侨乡村落，洋楼建筑群中西合璧'),
('gd_sg_02','石塘村','广东省','韶关市','仁化县',25.092,113.754,0,900,'丹霞山周边古村落，客家文化与丹霞地貌交融'),
('gd_zj_02','足荣村','广东省','湛江市','雷州市',20.745,109.998,0,600,'雷州半岛偏远村落，热带特色资源丰富'),
('gd_mz_02','侯南村','广东省','梅州市','大埔县',24.356,116.695,1,750,'大埔客家文化核心区，汉乐、鲤鱼灯等非遗项目丰富')
ON CONFLICT (id) DO NOTHING;

INSERT INTO teams (id, name, university, member_count, skills, preferred_categories, description, completed_count) VALUES
('t001','鹏城智联实践队','深圳大学',10,ARRAY['智慧城市','物联网','软件开发','数据分析'],ARRAY['digital','infrastructure'],'计算机与软件学院团队，专注智慧乡村与数字化建设',4),
('t002','岭南文脉守护团','中山大学',8,ARRAY['非遗保护','文创设计','田野调查','摄影'],ARRAY['culture','digital'],'专注岭南非物质文化遗产保护与文化创意开发',5),
('t003','粤农振兴科技队','华南农业大学',14,ARRAY['智慧农业','土壤检测','种植技术','农产品加工'],ARRAY['agriculture','digital','environment'],'农学与工程交叉团队，致力于岭南特色农业现代化',6),
('t004','医暖南粤服务队','南方医科大学',12,ARRAY['义诊','健康宣教','慢性病管理','急救培训'],ARRAY['medical','elderly_care'],'医学生组成的基层医疗志愿服务队',7),
('t005','绿美广东环保队','华南理工大学',10,ARRAY['环境监测','生态修复','GIS制图','环保科普'],ARRAY['environment','agriculture'],'环境与能源学院团队，专注广东农村生态环境调研与治理',3),
('t006','粤东支教先锋队','华南师范大学',16,ARRAY['学科教学','心理辅导','课程设计','艺术教育'],ARRAY['education','culture'],'师范类综合团队，专注粤东粤北乡村教育帮扶',8)
ON CONFLICT (id) DO NOTHING;

INSERT INTO village_needs (id, village_id, category, title, description, urgency, status, created_at) VALUES
('n_gz01','gd_gz_01','culture','广府文化传承活动策划','需要文化创意团队策划社区广府文化传承系列活动','low','pending','2026-04-10'),
('n_sz01','gd_sz_01','digital','智慧社区系统升级','需要计算机专业团队协助升级社区数字化管理系统','medium','pending','2026-06-01'),
('n_dg01','gd_dg_01','education','外来务工子女暑期托管','村内外来务工人员子女暑期无人看管，需要教育类团队开展托管服务','medium','pending','2026-05-20'),
('n_fs01','gd_fs_01','environment','河涌水质监测与治理','需要环境工程团队开展内河涌水质系统性监测','medium','pending','2026-05-15'),
('n_zh01','gd_zh_01','culture','古村活化与文创开发','需要设计类团队参与古村落活化利用与文创产品开发','low','pending','2026-04-28'),
('n_hz01','gd_hz_01','agriculture','海水养殖技术升级','需要水产专业团队指导现代化海水养殖技术','high','pending','2026-06-05'),
('n_jm01','gd_jm_01','culture','侨批档案数字化整理','大量侨批文献急需数字化归档与翻译整理','high','pending','2026-06-10'),
('n_zq01','gd_zq_01','infrastructure','古村落排水系统改造','古村排水系统老化，需要土木工程团队勘测设计','medium','pending','2026-05-20'),
('n_st01','gd_st_01','culture','潮汕非遗传承人记录计划','潮剧、潮绣等非遗传承人年事已高，急需影像记录','high','pending','2026-06-08'),
('n_st02','gd_st_01','digital','农产品电商平台搭建','潮汕特色农产品缺乏线上销售渠道','medium','pending','2026-05-25'),
('n_cz01','gd_cz_01','culture','潮州木雕技艺传承','传统木雕技艺后继乏人，需要艺术院校团队协助传承培训','high','pending','2026-05-30'),
('n_jy01','gd_jy_01','elderly_care','留守老人健康关爱','大量青壮年外出务工，留守老人健康管理需求突出','high','pending','2026-06-12'),
('n_sw01','gd_sw_01','education','革命老区教育帮扶','村小学师资力量薄弱，亟需师范类团队长期支教','high','pending','2026-06-15'),
('n_sw02','gd_sw_01','culture','红色文化旅游策划','红色文化资源丰富但缺乏专业策划与推广','medium','pending','2026-06-01'),
('n_sg01','gd_sg_01','culture','姓氏文化数字化项目','需要信息管理团队协助建立寻根文化数据库','medium','pending','2026-05-10'),
('n_qy01','gd_qy_01','infrastructure','古建筑群修缮勘察','锅耳楼群年久失修，急需建筑学团队勘测评估','high','pending','2026-06-01'),
('n_hy01','gd_hy_01','agriculture','猕猴桃种植技术培训','和平猕猴桃产业初具规模但技术落后，需要农业专家指导','high','pending','2026-06-08'),
('n_hy02','gd_hy_01','digital','乡村旅游线上推广','缺乏互联网营销能力，优质旅游资源未有效触达游客','medium','pending','2026-05-22'),
('n_mz01','gd_mz_01','culture','客家山歌传承保护','年轻一代对客家山歌兴趣缺失，需要音乐学团队策划传承项目','high','pending','2026-06-05'),
('n_zj01','gd_zj_01','agriculture','热带水果深加工技术','菠萝、芒果等热带水果缺乏深加工和冷链物流技术','high','pending','2026-06-10'),
('n_zj02','gd_zj_01','medical','基层医疗知识普及','村民慢性病管理意识薄弱，需要医疗团队开展健康教育','high','pending','2026-05-28'),
('n_mm01','gd_mm_01','agriculture','荔枝种植智能化改造','需要农业科技团队引入智能灌溉和病虫害监测系统','high','pending','2026-06-12'),
('n_mm02','gd_mm_01','environment','农业面源污染防治','荔枝种植农药化肥用量大，需要环保团队指导绿色种植','medium','pending','2026-05-20'),
('n_yj01','gd_yj_01','environment','近海渔业资源调查','需要海洋科学团队开展近海渔业资源现状调研','high','pending','2026-06-15'),
('n_yj02','gd_yj_01','elderly_care','渔民职业病健康筛查','老渔民长期海上作业积累职业病，需要医疗团队筛查','medium','pending','2026-05-18'),
('n_yf01','gd_yf_01','environment','石材加工粉尘治理','石材加工粉尘污染严重影响村民健康，需要环保技术方案','high','pending','2026-06-08'),
('n_yf02','gd_yf_01','medical','尘肺病预防宣传教育','从业人员职业病防护意识差，急需健康宣教和防护培训','high','pending','2026-06-10'),
('n_hz02','gd_hz_02','medical','中草药种植技术升级','需要中医药专业团队指导规范化种植与品牌建设','medium','pending','2026-06-01'),
('n_jm02','gd_jm_02','education','侨乡留守儿童关爱','父母出国务工，大量留守儿童需要心理关怀和课业辅导','high','pending','2026-06-12'),
('n_sg02','gd_sg_02','environment','丹霞地貌生态保护','旅游开发与生态保护矛盾突出，需要生态学团队调研','medium','pending','2026-05-28'),
('n_zj03','gd_zj_02','education','村小教学设备更新','村小教学设备老旧，急需计算机和多媒体教学设备','high','pending','2026-06-15'),
('n_zj04','gd_zj_02','medical','乡村医生培训','村医仅一名且年龄偏大，需要医疗团队协助培训和义诊','high','pending','2026-06-10'),
('n_mz02','gd_mz_02','culture','广东汉乐传承教学','广东汉乐传承人老龄化，需要音乐院校团队协助教学传承','high','pending','2026-05-30'),
('n_mz03','gd_mz_02','elderly_care','高龄老人居家养老服务','村内高龄独居老人占比高，需要社工团队开展居家养老服务','high','pending','2026-06-08')
ON CONFLICT (id) DO NOTHING;

-- 添加 RLS 策略（允许匿名读写，方便测试）
ALTER TABLE villages ENABLE ROW LEVEL SECURITY;
ALTER TABLE village_needs ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE need_team_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on villages" ON villages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on village_needs" ON village_needs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on teams" ON teams FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on matches" ON matches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on need_team_matches" ON need_team_matches FOR ALL USING (true) WITH CHECK (true);

-- 匹配关联数据
INSERT INTO need_team_matches (village_id, team_id) VALUES
('gd_sz_01','t001'),
('gd_gz_01','t002'),
('gd_fs_01','t005')
ON CONFLICT DO NOTHING;
