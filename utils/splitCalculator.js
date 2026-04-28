exports.calculateEqualSplit = (totalAmount, memberIds) => {
  const share = parseFloat((totalAmount / memberIds.length).toFixed(2));
  const splits = memberIds.map(id => ({ user: id, amount: share, settled: false }));
  const diff = parseFloat((totalAmount - share * memberIds.length).toFixed(2));
  if (diff !== 0) splits[0].amount = parseFloat((splits[0].amount + diff).toFixed(2));
  return splits;
};

exports.simplifyDebts = (debts) => {
  const net = {};
  debts.forEach(({ from, to, amount }) => {
    net[from] = (net[from] || 0) - amount;
    net[to]   = (net[to]   || 0) + amount;
  });

  const creditors = [], debtors = [];
  Object.entries(net).forEach(([person, bal]) => {
    if (bal > 0)  creditors.push({ person, bal });
    else if (bal < 0) debtors.push({ person, bal: -bal });
  });

  const result = [];
  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].bal, creditors[j].bal);
    result.push({ from: debtors[i].person, to: creditors[j].person, amount: parseFloat(pay.toFixed(2)) });
    debtors[i].bal   -= pay;
    creditors[j].bal -= pay;
    if (debtors[i].bal   < 0.01) i++;
    if (creditors[j].bal < 0.01) j++;
  }
  return result;
};
