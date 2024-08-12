export function formatLoad(load: string | null): string {
    if (!load) return '无';
  
    const loadMap: { [key: string]: string } = {
      'Own Equipment': '自带机械',
      'Site Equipment': '工地机械',
      'Manual Loading': '人工装车',
      'On-site Transport': '场内倒运',
    };
  
    return loadMap[load] || load;
  }
  