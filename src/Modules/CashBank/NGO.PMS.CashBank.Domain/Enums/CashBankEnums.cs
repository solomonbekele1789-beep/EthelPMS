namespace NGO.PMS.CashBank.Domain.Enums;

public enum BankAccountType
{
    Checking = 1,
    Savings = 2,
    PettyCash = 3,
    MobileMoney = 4,
    ForeignCurrency = 5
}

public enum CashTransactionType
{
    Receipt = 1,
    Payment = 2,
    TransferIn = 3,
    TransferOut = 4,
    BankCharge = 5,
    Interest = 6
}

public enum CashTransactionStatus
{
    Draft = 1,
    PendingApproval = 2,
    Approved = 3,
    Posted = 4,
    Voided = 5
}

public enum ReconciliationStatus
{
    InProgress = 1,
    Completed = 2,
    Approved = 3
}
