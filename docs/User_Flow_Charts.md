# FinT - User Flow Charts

## 1. Authentication & Onboarding Flow

```mermaid
flowchart TD
    A[User visits app] --> B{User registered?}
    B -->|No| C[Registration Form]
    B -->|Yes| D[Login Form]
    
    C --> C1[Fill: Name, Email, Password]
    C1 --> C2[Validate Form]
    C2 --> C3{Valid?}
    C3 -->|No| C1
    C3 -->|Yes| C4[Create Account]
    C4 --> D
    
    D --> D1[Enter: Email, Password]
    D1 --> D2[Validate Credentials]
    D2 --> D3{Valid?}
    D3 -->|No| D4[Show Error Toast]
    D4 --> D1
    D3 -->|Yes| E[Business Selection]
    
    E --> E1{Business exists?}
    E1 -->|No| F[Create Business Form]
    E1 -->|Yes| G[Select Business]
    
    F --> F1[Fill: Name, Type, Description]
    F1 --> F2[Create Business]
    F2 --> G
    
    G --> H[Dashboard]
```

## 2. Journal Entry Creation Flow

```mermaid
flowchart TD
    A[Dashboard] --> B[Navigate to Journal Entries]
    B --> C[Click 'Add Entry']
    C --> D[Journal Entry Form]
    
    D --> D1[Enter Date]
    D1 --> D2[Enter Description]
    D2 --> D3[Select Debit Account]
    D3 --> D4[Select Credit Account]
    D4 --> D5[Enter Amount]
    
    D5 --> E{Validate Form}
    E -->|Invalid| E1[Show Error Toast]
    E1 --> D
    E -->|Valid| F[Post Entry]
    
    F --> G[Show Success Toast]
    G --> H[Entry Added to List]
    H --> I[Update Account Balances]
```

## 3. Bank Reconciliation Flow

```mermaid
flowchart TD
    A[Banking Section] --> B[Bank Reconciliation]
    B --> C[Upload Statement]
    
    C --> C1[Select PDF File]
    C1 --> C2[Choose Bank Type]
    C2 --> C3{Password Protected?}
    C3 -->|Yes| C4[Enter Password]
    C3 -->|No| C5[Process File]
    C4 --> C5
    
    C5 --> C6[OCR Processing]
    C6 --> C7[Extract Transactions]
    C7 --> D[Reconciliation Table]
    
    D --> D1[View Bank Transactions]
    D1 --> D2[View Book Transactions]
    D2 --> D3[Match Transactions]
    
    D3 --> D4{Match Found?}
    D4 -->|Yes| D5[Click Reconcile]
    D4 -->|No| D6[Manual Review]
    
    D5 --> D7[Mark as Reconciled]
    D6 --> D8[Add to Unreconciled]
    
    D7 --> E[Update Balances]
    D8 --> E
```

## 4. Report Generation Flow

```mermaid
flowchart TD
    A[Reports Section] --> B[Select Report Type]
    B --> C{Report Type}
    
    C -->|Income Statement| D1[Set Date Range]
    C -->|Balance Sheet| D2[Set As-of Date]
    C -->|Trial Balance| D3[Set Date Range]
    C -->|Custom Report| D4[Select Template]
    
    D1 --> E[Generate Report]
    D2 --> E
    D3 --> E
    D4 --> E
    
    E --> F[Display Report]
    F --> G{Export Needed?}
    G -->|Yes| H[Select Format]
    G -->|No| I[View Report]
    
    H --> H1[PDF/Excel/CSV]
    H1 --> H2[Download File]
    I --> J[End]
    H2 --> J
```

## 5. Chart of Accounts Management Flow

```mermaid
flowchart TD
    A[Accounting Section] --> B[Chart of Accounts]
    B --> C{Action}
    
    C -->|View| D[Display Accounts]
    C -->|Add| E[Add Account Form]
    C -->|Edit| F[Edit Account Form]
    C -->|Delete| G[Delete Confirmation]
    
    D --> D1[Group by Type]
    D1 --> D2[Search/Filter]
    D2 --> H[End]
    
    E --> E1[Enter Code]
    E1 --> E2[Enter Name]
    E2 --> E3[Select Type]
    E3 --> E4[Enter Description]
    E4 --> E5[Save Account]
    E5 --> I[Show Success Toast]
    I --> J[Refresh List]
    J --> H
    
    F --> F1[Load Current Data]
    F1 --> F2[Modify Fields]
    F2 --> F3[Update Account]
    F3 --> I
    
    G --> G1{Confirm Delete?}
    G1 -->|Yes| G2[Delete Account]
    G1 -->|No| H
    G2 --> I
```

## 6. Settings Management Flow

```mermaid
flowchart TD
    A[Settings Section] --> B{Settings Type}
    
    B -->|Business Profile| C[Business Settings]
    B -->|User Management| D[User Management]
    B -->|Account Types| E[Account Types]
    B -->|Data Export| F[Data Export]
    
    C --> C1[Edit Business Info]
    C1 --> C2[Save Changes]
    C2 --> G[Show Success Toast]
    
    D --> D1[View Users]
    D1 --> D2{Action}
    D2 -->|Add User| D3[Add User Form]
    D2 -->|Edit User| D4[Edit User Form]
    D2 -->|Remove User| D5[Remove Confirmation]
    
    D3 --> D6[Enter User Details]
    D6 --> D7[Assign Role]
    D7 --> G
    
    D4 --> D8[Modify User Details]
    D8 --> G
    
    D5 --> D9{Confirm Remove?}
    D9 -->|Yes| D10[Remove User]
    D9 -->|No| H[End]
    D10 --> G
    
    E --> E1[View Account Types]
    E1 --> E2[Add/Edit Types]
    E2 --> G
    
    F --> F1[Select Data]
    F1 --> F2[Choose Format]
    F2 --> F3[Export Data]
    F3 --> G
    
    G --> H
```

## 7. AI Assistant Flow

```mermaid
flowchart TD
    A[AI Assistant] --> B[Chat Interface]
    B --> C[User Input]
    
    C --> D{Query Type}
    D -->|How-to Question| E[Provide Instructions]
    D -->|Concept Question| F[Explain Accounting Concept]
    D -->|Action Request| G[Execute Action]
    D -->|Report Request| H[Generate Report]
    
    E --> E1[Step-by-step Guide]
    E1 --> I[Display Response]
    
    F --> F1[Educational Response]
    F1 --> I
    
    G --> G1{Action Type}
    G1 -->|Create Entry| G2[Open Journal Form]
    G1 -->|View Report| G3[Navigate to Reports]
    G1 -->|Reconcile| G4[Open Reconciliation]
    
    G2 --> I
    G3 --> I
    G4 --> I
    
    H --> H1[Generate Report]
    H1 --> H2[Display Report]
    H2 --> I
    
    I --> J{Continue Chat?}
    J -->|Yes| C
    J -->|No| K[End Session]
```

## 8. Error Handling Flow

```mermaid
flowchart TD
    A[User Action] --> B{Action Valid?}
    B -->|Yes| C[Execute Action]
    B -->|No| D[Show Validation Error]
    
    C --> E{Action Successful?}
    E -->|Yes| F[Show Success Toast]
    E -->|No| G[Show Error Toast]
    
    D --> H[Highlight Error Fields]
    H --> I[User Corrects]
    I --> A
    
    F --> J[Update UI]
    G --> K[Log Error]
    
    J --> L[Continue]
    K --> M[Show Error Details]
    M --> N{Retry?}
    N -->|Yes| A
    N -->|No| O[Cancel Action]
    
    L --> P[End]
    O --> P
```

## 9. Mobile Responsive Flow

```mermaid
flowchart TD
    A[User Access] --> B{Device Type}
    B -->|Desktop| C[Full Interface]
    B -->|Mobile| D[Mobile Interface]
    B -->|Tablet| E[Tablet Interface]
    
    C --> C1[Sidebar Navigation]
    C1 --> C2[Full Tables]
    C2 --> C3[Desktop Forms]
    
    D --> D1[Collapsible Menu]
    D1 --> D2[Responsive Tables]
    D2 --> D3[Mobile Forms]
    D3 --> D4[Touch Gestures]
    
    E --> E1[Adaptive Layout]
    E1 --> E2[Medium Tables]
    E2 --> E3[Touch-Optimized Forms]
    
    C3 --> F[User Interaction]
    D4 --> F
    E3 --> F
    
    F --> G[Process Action]
    G --> H[Update UI]
    H --> I[End]
```

## 10. Security & Permissions Flow

```mermaid
flowchart TD
    A[User Request] --> B{Authenticated?}
    B -->|No| C[Redirect to Login]
    B -->|Yes| D{Authorized?}
    
    C --> C1[Login Form]
    C1 --> C2[Validate Credentials]
    C2 --> C3{Valid?}
    C3 -->|No| C4[Show Error]
    C3 -->|Yes| C5[Create Session]
    C4 --> C1
    C5 --> A
    
    D -->|No| E[Show Permission Error]
    D -->|Yes| F[Execute Action]
    
    E --> E1[Log Access Attempt]
    E1 --> G[End]
    
    F --> H[Audit Log]
    H --> I[Return Result]
    I --> J[End]
```

These flowcharts provide visual representations of the key user interactions in the FinT accounting application, making it easier to understand the application flow and identify potential improvements. 