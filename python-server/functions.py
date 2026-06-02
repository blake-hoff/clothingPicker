from datetime import date

def lookupTodayEntry(databaseVariable):
    # get the current date in the correct format
    today = date.today()

    # order (sort) the database in descending order by the by the 
    entry_exists = databaseVariable.query.order_by(databaseVariable.created_at.desc()).first()

    if entry_exists:
        return True
    else:
        return False