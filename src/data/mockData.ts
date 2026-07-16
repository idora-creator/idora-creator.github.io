import type { Village, Team, NeedCategory } from '../types';

// ===== 广东省 21 个地级市行政村 Mock 数据 =====
// visitCount: 0=灰色(实践空白), 1-4=稀少, 5-9=低频, 10-14=温热, 15-19=较热, 20+=高频

export const GD_CENTER = { lat: 23.35, lng: 113.50 };
export const GD_ZOOM = 7;

export const mockVillages: Village[] = [
  // ===== 珠三角 — 热门区域 =====
  {
    id: 'gd_sz_01', name: '南岭村', province: '广东省', city: '深圳市', county: '龙岗区',
    lat: 22.5431, lng: 114.0579, visitCount: 26, population: 3200,
    description: '深圳改革开放示范村，集体经济发达，每年吸引大量高校实践团队前来学习调研',
    needs: [
      { id: 'n_sz01', category: 'digital', title: '智慧社区系统升级', description: '需要计算机专业团队协助升级社区数字化管理系统', urgency: 'medium', status: 'pending', createdAt: '2026-06-01' },
    ],
    matchedTeamIds: ['t001'],
  },
  {
    id: 'gd_gz_01', name: '大源村', province: '广东省', city: '广州市', county: '白云区',
    lat: 23.1291, lng: 113.2644, visitCount: 22, population: 5800,
    description: '广州电商第一村，物流与直播产业聚集地',
    needs: [
      { id: 'n_gz01', category: 'culture', title: '广府文化传承活动策划', description: '需要文化创意团队策划社区广府文化传承系列活动', urgency: 'low', status: 'pending', createdAt: '2026-04-10' },
    ],
    matchedTeamIds: ['t002'],
  },
  {
    id: 'gd_dg_01', name: '雁田村', province: '广东省', city: '东莞市', county: '凤岗镇',
    lat: 22.746, lng: 114.149, visitCount: 18, population: 4500,
    description: '东莞制造业强村，电子信息产业聚集',
    needs: [
      { id: 'n_dg01', category: 'education', title: '外来务工子女暑期托管', description: '村内外来务工人员子女暑期无人看管，需要教育类团队开展托管服务', urgency: 'medium', status: 'pending', createdAt: '2026-05-20' },
    ],
    matchedTeamIds: [],
  },
  {
    id: 'gd_fs_01', name: '紫南村', province: '广东省', city: '佛山市', county: '禅城区',
    lat: 23.0218, lng: 113.1214, visitCount: 16, population: 3800,
    description: '佛山乡村振兴样板村，岭南水乡风貌典范',
    needs: [
      { id: 'n_fs01', category: 'environment', title: '河涌水质监测与治理', description: '需要环境工程团队开展内河涌水质系统性监测', urgency: 'medium', status: 'pending', createdAt: '2026-05-15' },
    ],
    matchedTeamIds: ['t005'],
  },
  {
    id: 'gd_zh_01', name: '会同村', province: '广东省', city: '珠海市', county: '香洲区',
    lat: 22.370, lng: 113.553, visitCount: 15, population: 2100,
    description: '珠海历史文化名村，高校毗邻，产学研合作活跃',
    needs: [
      { id: 'n_zh01', category: 'culture', title: '古村活化与文创开发', description: '需要设计类团队参与古村落活化利用与文创产品开发', urgency: 'low', status: 'pending', createdAt: '2026-04-28' },
    ],
    matchedTeamIds: [],
  },
  {
    id: 'gd_zs_01', name: '崖口村', province: '广东省', city: '中山市', county: '南朗镇',
    lat: 22.496, lng: 113.552, visitCount: 12, population: 2600,
    description: '中山生态农业示范村，稻田观光与民宿产业发展迅速',
    needs: [],
    matchedTeamIds: [],
  },
  {
    id: 'gd_hz_01', name: '范和村', province: '广东省', city: '惠州市', county: '惠东县',
    lat: 22.800, lng: 114.782, visitCount: 10, population: 3100,
    description: '惠州滨海古村落，渔耕文化保存完好',
    needs: [
      { id: 'n_hz01', category: 'agriculture', title: '海水养殖技术升级', description: '需要水产专业团队指导现代化海水养殖技术', urgency: 'high', status: 'pending', createdAt: '2026-06-05' },
    ],
    matchedTeamIds: [],
  },
  {
    id: 'gd_jm_01', name: '自力村', province: '广东省', city: '江门市', county: '开平市',
    lat: 22.313, lng: 112.588, visitCount: 14, population: 1800,
    description: '世界文化遗产开平碉楼核心村落，侨乡文化代表',
    needs: [
      { id: 'n_jm01', category: 'culture', title: '侨批档案数字化整理', description: '大量侨批文献急需数字化归档与翻译整理', urgency: 'high', status: 'pending', createdAt: '2026-06-10' },
    ],
    matchedTeamIds: [],
  },
  {
    id: 'gd_zq_01', name: '黎槎村', province: '广东省', city: '肇庆市', county: '高要区',
    lat: 23.047, lng: 112.465, visitCount: 8, population: 1500,
    description: '八卦村布局独特，岭南古建筑群保存完整',
    needs: [
      { id: 'n_zq01', category: 'infrastructure', title: '古村落排水系统改造', description: '古村排水系统老化，需要土木工程团队勘测设计', urgency: 'medium', status: 'pending', createdAt: '2026-05-20' },
    ],
    matchedTeamIds: [],
  },

  // ===== 粤东 — 低频/中频 =====
  {
    id: 'gd_st_01', name: '前美村', province: '广东省', city: '汕头市', county: '澄海区',
    lat: 23.460, lng: 116.766, visitCount: 6, population: 2800,
    description: '潮汕传统民居群保存完好，侨乡文化底蕴深厚',
    needs: [
      { id: 'n_st01', category: 'culture', title: '潮汕非遗传承人记录计划', description: '潮剧、潮绣等非遗传承人年事已高，急需影像记录', urgency: 'high', status: 'pending', createdAt: '2026-06-08' },
      { id: 'n_st02', category: 'digital', title: '农产品电商平台搭建', description: '潮汕特色农产品缺乏线上销售渠道', urgency: 'medium', status: 'pending', createdAt: '2026-05-25' },
    ],
    matchedTeamIds: [],
  },
  {
    id: 'gd_cz_01', name: '龙湖古寨', province: '广东省', city: '潮州市', county: '潮安区',
    lat: 23.657, lng: 116.623, visitCount: 5, population: 2200,
    description: '潮州千年古寨，韩江畔的历史文化名村',
    needs: [
      { id: 'n_cz01', category: 'culture', title: '潮州木雕技艺传承', description: '传统木雕技艺后继乏人，需要艺术院校团队协助传承培训', urgency: 'high', status: 'pending', createdAt: '2026-05-30' },
    ],
    matchedTeamIds: [],
  },
  {
    id: 'gd_jy_01', name: '棉湖村', province: '广东省', city: '揭阳市', county: '揭西县',
    lat: 23.450, lng: 116.123, visitCount: 3, population: 3600,
    description: '揭西客家村落，传统农耕与外出务工并存',
    needs: [
      { id: 'n_jy01', category: 'elderly_care', title: '留守老人健康关爱', description: '大量青壮年外出务工，留守老人健康管理需求突出', urgency: 'high', status: 'pending', createdAt: '2026-06-12' },
    ],
    matchedTeamIds: [],
  },
  {
    id: 'gd_sw_01', name: '新山村', province: '广东省', city: '汕尾市', county: '海丰县',
    lat: 22.786, lng: 115.375, visitCount: 0, population: 1200,
    description: '海丰革命老区村，红色资源丰富但开发不足',
    needs: [
      { id: 'n_sw01', category: 'education', title: '革命老区教育帮扶', description: '村小学师资力量薄弱，亟需师范类团队长期支教', urgency: 'high', status: 'pending', createdAt: '2026-06-15' },
      { id: 'n_sw02', category: 'culture', title: '红色文化旅游策划', description: '红色文化资源丰富但缺乏专业策划与推广', urgency: 'medium', status: 'pending', createdAt: '2026-06-01' },
    ],
    matchedTeamIds: [],
  },

  // ===== 粤北 — 多数为实践空白 =====
  {
    id: 'gd_sg_01', name: '珠玑村', province: '广东省', city: '韶关市', county: '南雄市',
    lat: 25.117, lng: 114.335, visitCount: 4, population: 1800,
    description: '珠玑古巷所在地，广府人寻根圣地',
    needs: [
      { id: 'n_sg01', category: 'culture', title: '姓氏文化数字化项目', description: '需要信息管理团队协助建立寻根文化数据库', urgency: 'medium', status: 'pending', createdAt: '2026-05-10' },
    ],
    matchedTeamIds: [],
  },
  {
    id: 'gd_qy_01', name: '上岳村', province: '广东省', city: '清远市', county: '佛冈县',
    lat: 23.860, lng: 113.511, visitCount: 2, population: 2500,
    description: '锅耳楼古建筑群，岭南特色民居代表',
    needs: [
      { id: 'n_qy01', category: 'infrastructure', title: '古建筑群修缮勘察', description: '锅耳楼群年久失修，急需建筑学团队勘测评估', urgency: 'high', status: 'pending', createdAt: '2026-06-01' },
    ],
    matchedTeamIds: [],
  },
  {
    id: 'gd_hy_01', name: '林寨村', province: '广东省', city: '河源市', county: '和平县',
    lat: 24.244, lng: 115.016, visitCount: 0, population: 3200,
    description: '东江流域客家古村落，四角楼建筑群独特',
    needs: [
      { id: 'n_hy01', category: 'agriculture', title: '猕猴桃种植技术培训', description: '和平猕猴桃产业初具规模但技术落后，需要农业专家指导', urgency: 'high', status: 'pending', createdAt: '2026-06-08' },
      { id: 'n_hy02', category: 'digital', title: '乡村旅游线上推广', description: '缺乏互联网营销能力，优质旅游资源未有效触达游客', urgency: 'medium', status: 'pending', createdAt: '2026-05-22' },
    ],
    matchedTeamIds: [],
  },
  {
    id: 'gd_mz_01', name: '桥溪村', province: '广东省', city: '梅州市', county: '梅县区',
    lat: 24.289, lng: 116.122, visitCount: 5, population: 900,
    description: '客家古村落典范，围龙屋建筑保存完好',
    needs: [
      { id: 'n_mz01', category: 'culture', title: '客家山歌传承保护', description: '年轻一代对客家山歌兴趣缺失，需要音乐学团队策划传承项目', urgency: 'high', status: 'pending', createdAt: '2026-06-05' },
    ],
    matchedTeamIds: [],
  },

  // ===== 粤西 — 实践空白集中区 =====
  {
    id: 'gd_zj_01', name: '邦塘村', province: '广东省', city: '湛江市', county: '雷州市',
    lat: 20.910, lng: 110.085, visitCount: 1, population: 2100,
    description: '雷州半岛传统村落，热带农业与海洋资源丰富',
    needs: [
      { id: 'n_zj01', category: 'agriculture', title: '热带水果深加工技术', description: '菠萝、芒果等热带水果缺乏深加工和冷链物流技术', urgency: 'high', status: 'pending', createdAt: '2026-06-10' },
      { id: 'n_zj02', category: 'medical', title: '基层医疗知识普及', description: '村民慢性病管理意识薄弱，需要医疗团队开展健康教育', urgency: 'high', status: 'pending', createdAt: '2026-05-28' },
    ],
    matchedTeamIds: [],
  },
  {
    id: 'gd_mm_01', name: '八坊村', province: '广东省', city: '茂名市', county: '高州市',
    lat: 21.920, lng: 110.870, visitCount: 0, population: 2800,
    description: '茂名荔枝产区核心村，农业大村但科技化程度低',
    needs: [
      { id: 'n_mm01', category: 'agriculture', title: '荔枝种植智能化改造', description: '需要农业科技团队引入智能灌溉和病虫害监测系统', urgency: 'high', status: 'pending', createdAt: '2026-06-12' },
      { id: 'n_mm02', category: 'environment', title: '农业面源污染防治', description: '荔枝种植农药化肥用量大，需要环保团队指导绿色种植', urgency: 'medium', status: 'pending', createdAt: '2026-05-20' },
    ],
    matchedTeamIds: [],
  },
  {
    id: 'gd_yj_01', name: '大澳村', province: '广东省', city: '阳江市', county: '阳东区',
    lat: 21.858, lng: 112.023, visitCount: 0, population: 1500,
    description: '渔港古村落，海洋渔业文化与疍家民俗独特',
    needs: [
      { id: 'n_yj01', category: 'environment', title: '近海渔业资源调查', description: '需要海洋科学团队开展近海渔业资源现状调研', urgency: 'high', status: 'pending', createdAt: '2026-06-15' },
      { id: 'n_yj02', category: 'elderly_care', title: '渔民职业病健康筛查', description: '老渔民长期海上作业积累职业病，需要医疗团队筛查', urgency: 'medium', status: 'pending', createdAt: '2026-05-18' },
    ],
    matchedTeamIds: [],
  },
  {
    id: 'gd_yf_01', name: '水东村', province: '广东省', city: '云浮市', county: '云城区',
    lat: 22.915, lng: 112.045, visitCount: 0, population: 1100,
    description: '云浮石文化村落，石材产业发达但环保问题突出',
    needs: [
      { id: 'n_yf01', category: 'environment', title: '石材加工粉尘治理', description: '石材加工粉尘污染严重影响村民健康，需要环保技术方案', urgency: 'high', status: 'pending', createdAt: '2026-06-08' },
      { id: 'n_yf02', category: 'medical', title: '尘肺病预防宣传教育', description: '从业人员职业病防护意识差，急需健康宣教和防护培训', urgency: 'high', status: 'pending', createdAt: '2026-06-10' },
    ],
    matchedTeamIds: [],
  },

  // ===== 更多村落 =====
  {
    id: 'gd_hz_02', name: '旭日村', province: '广东省', city: '惠州市', county: '博罗县',
    lat: 23.382, lng: 114.287, visitCount: 2, population: 1300,
    description: '罗浮山脚下古村落，中草药种植传统悠久',
    needs: [
      { id: 'n_hz02', category: 'medical', title: '中草药种植技术升级', description: '需要中医药专业团队指导规范化种植与品牌建设', urgency: 'medium', status: 'pending', createdAt: '2026-06-01' },
    ],
    matchedTeamIds: [],
  },
  {
    id: 'gd_jm_02', name: '浮月村', province: '广东省', city: '江门市', county: '台山市',
    lat: 22.083, lng: 112.732, visitCount: 3, population: 1600,
    description: '台山侨乡村落，洋楼建筑群中西合璧',
    needs: [
      { id: 'n_jm02', category: 'education', title: '侨乡留守儿童关爱', description: '父母出国务工，大量留守儿童需要心理关怀和课业辅导', urgency: 'high', status: 'pending', createdAt: '2026-06-12' },
    ],
    matchedTeamIds: [],
  },
  {
    id: 'gd_sg_02', name: '石塘村', province: '广东省', city: '韶关市', county: '仁化县',
    lat: 25.092, lng: 113.754, visitCount: 0, population: 900,
    description: '丹霞山周边古村落，客家文化与丹霞地貌交融',
    needs: [
      { id: 'n_sg02', category: 'environment', title: '丹霞地貌生态保护', description: '旅游开发与生态保护矛盾突出，需要生态学团队调研', urgency: 'medium', status: 'pending', createdAt: '2026-05-28' },
    ],
    matchedTeamIds: [],
  },
  {
    id: 'gd_zj_02', name: '足荣村', province: '广东省', city: '湛江市', county: '雷州市',
    lat: 20.745, lng: 109.998, visitCount: 0, population: 600,
    description: '雷州半岛偏远村落，热带特色资源丰富但极度缺乏关注',
    needs: [
      { id: 'n_zj03', category: 'education', title: '村小教学设备更新', description: '村小教学设备老旧，急需计算机和多媒体教学设备', urgency: 'high', status: 'pending', createdAt: '2026-06-15' },
      { id: 'n_zj04', category: 'medical', title: '乡村医生培训', description: '村医仅一名且年龄偏大，需要医疗团队协助培训和义诊', urgency: 'high', status: 'pending', createdAt: '2026-06-10' },
    ],
    matchedTeamIds: [],
  },
  {
    id: 'gd_mz_02', name: '侯南村', province: '广东省', city: '梅州市', county: '大埔县',
    lat: 24.356, lng: 116.695, visitCount: 1, population: 750,
    description: '大埔客家文化核心区，汉乐、鲤鱼灯等非遗项目丰富',
    needs: [
      { id: 'n_mz02', category: 'culture', title: '广东汉乐传承教学', description: '广东汉乐传承人老龄化，需要音乐院校团队协助教学传承', urgency: 'high', status: 'pending', createdAt: '2026-05-30' },
      { id: 'n_mz03', category: 'elderly_care', title: '高龄老人居家养老服务', description: '村内高龄独居老人占比高，需要社工团队开展居家养老服务', urgency: 'high', status: 'pending', createdAt: '2026-06-08' },
    ],
    matchedTeamIds: [],
  },
];

export const mockTeams: Team[] = [
  {
    id: 't001', name: '鹏城智联实践队', university: '深圳大学',
    memberCount: 10, skills: ['智慧城市', '物联网', '软件开发', '数据分析'],
    preferredCategories: ['digital', 'infrastructure'],
    description: '计算机与软件学院团队，专注智慧乡村与数字化建设',
    completedCount: 4,
  },
  {
    id: 't002', name: '岭南文脉守护团', university: '中山大学',
    memberCount: 8, skills: ['非遗保护', '文创设计', '田野调查', '摄影'],
    preferredCategories: ['culture', 'digital'],
    description: '专注岭南非物质文化遗产保护与文化创意开发',
    completedCount: 5,
  },
  {
    id: 't003', name: '粤农振兴科技队', university: '华南农业大学',
    memberCount: 14, skills: ['智慧农业', '土壤检测', '种植技术', '农产品加工'],
    preferredCategories: ['agriculture', 'digital', 'environment'],
    description: '农学与工程交叉团队，致力于岭南特色农业现代化',
    completedCount: 6,
  },
  {
    id: 't004', name: '医暖南粤服务队', university: '南方医科大学',
    memberCount: 12, skills: ['义诊', '健康宣教', '慢性病管理', '急救培训'],
    preferredCategories: ['medical', 'elderly_care'],
    description: '医学生组成的基层医疗志愿服务队',
    completedCount: 7,
  },
  {
    id: 't005', name: '绿美广东环保队', university: '华南理工大学',
    memberCount: 10, skills: ['环境监测', '生态修复', 'GIS制图', '环保科普'],
    preferredCategories: ['environment', 'agriculture'],
    description: '环境与能源学院团队，专注广东农村生态环境调研与治理',
    completedCount: 3,
  },
  {
    id: 't006', name: '粤东支教先锋队', university: '华南师范大学',
    memberCount: 16, skills: ['学科教学', '心理辅导', '课程设计', '艺术教育'],
    preferredCategories: ['education', 'culture'],
    description: '师范类综合团队，专注粤东粤北乡村教育帮扶',
    completedCount: 8,
  },
];

export function getAllCategories(): NeedCategory[] {
  return ['education', 'medical', 'agriculture', 'culture', 'environment', 'elderly_care', 'infrastructure', 'digital'];
}

export function getHeatColor(visitCount: number): string {
  if (visitCount >= 20) return '#E53E3E';
  if (visitCount >= 15) return '#F56565';
  if (visitCount >= 10) return '#ED8936';
  if (visitCount >= 5) return '#F6C23E';
  if (visitCount >= 1) return '#68D391';
  return '#A0AEC0';
}

export function getVisitLabel(count: number): string {
  if (count >= 20) return '高频到访';
  if (count >= 10) return '中频到访';
  if (count >= 5) return '低频到访';
  if (count >= 1) return '极少到访';
  return '实践空白';
}
