from datetime import date, datetime
from email_validator import validate_email, EmailNotValidError

def invalidUserParamaters(username, password, email='name@email.net'):
    # print(username, email, password)
    try: # these criteria must be met. if they are not met, an error will occur, jumping to the except block.
        assert isinstance(username, str), "The username is not a string"
        assert len(username) >= 3, "Username must be at least 3 characters"
        assert username.isalnum(), "Username must be alphanumeric"
        assert validate_email(email, check_deliverability=False)
        assert len(password) >= 10, "Password must be at least 10 characters"
    except AssertionError as e:
        return True, str(e)
    except EmailNotValidError as e:
        return True, str(e)
    
    return False, 'Valid user parameters'


# local data import functions
def ensureTwoDigits(inputDigit):
    digit_as_string = f'{inputDigit}'
    if(len(digit_as_string) == 1):
        digit_as_string = '0' + digit_as_string

    return digit_as_string

def convertToDate(stringDate):
    newDate = '2025-06-22'
    yearDict = {
        'January': 2026,
        'February': 2026,
        'March': 2026,
        'April': 2026,
        'May': 2026,
        'June': 2026,
        'September': 2025,
        'October': 2025,
        'November': 2025,
        'December': 2025
    }

    month_as_string = stringDate.split(' ')[0]

    day_as_string = ensureTwoDigits(stringDate.split(' ')[1])

    month_as_int = ensureTwoDigits(datetime.strptime(month_as_string, "%B").month)

    year = ''

    try:
        year = yearDict[month_as_string]
    except: 
        year = 2025
    
    # iso format:
    # YYYY-MM-DDTHH:mm:ss
    newDate = f'{year}-{month_as_int}-{day_as_string}T00:00:00'
    newDate = datetime.fromisoformat(newDate)

    return newDate


# start with a csv file and fill in the database
# first format into a list of dictionaries with 'date', 'outfitDesc'
def import_local_csv(databaseObject, dbModel):
    csvData = ''
    with open('data.csv', 'r') as f: 
        csvData = [{'date': convertToDate(line.split('-')[0]), 'desc': line.split('-')[1].strip()} for line in f.readlines()]

    cleanedData = []
    for i in range(len(csvData)):
        # print(csvData[i]['desc'])
        if csvData[i]['desc'] != '':
            cleanedData.append(csvData[i])
        
    
    # for row in cleanedData:
    #     print(row) 

    print(type(csvData))
    for item in cleanedData:
        entry = databaseObject(
            name='import',
            description=item['desc'],
            icon='https://images.unsplash.com/vector-1775556825284-3b697bc284bf?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.1.0',
            entry_date=item['date'],
            created_at=item['date']
        )        
        dbModel.session.add(entry)

    dbModel.session.commit()


# unused function
def lookupTodayEntry(databaseVariable):
    # get the current date in the correct format
    today = date.today()

    # order (sort) the database in descending order by the by the 
    entry_exists = databaseVariable.query.order_by(databaseVariable.created_at.desc()).first()

    if entry_exists:
        return True
    else:
        return False
    
