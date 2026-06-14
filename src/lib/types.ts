// Domain types for splitly. All money is stored as integer cents.

export interface Group {
  id: string;
  name: string;
  currency: string;
  createdAt: number;
}

export interface Member {
  id: string;
  groupId: string;
  name: string;
}

export interface Expense {
  id: string;
  groupId: string;
  description: string;
  amountCents: number;
  paidBy: string;
  createdAt: number;
  sharerIds: string[];
}

export interface Balance {
  memberId: string;
  balanceCents: number;
}

export interface Transfer {
  fromMemberId: string;
  toMemberId: string;
  amountCents: number;
}
