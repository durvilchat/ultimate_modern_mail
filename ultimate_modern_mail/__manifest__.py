# -*- coding: utf-8 -*-
{
    'name': "Ultimate modern mail",

    'summary': """Utimate modern mail is a module that has been developed to improve basic email that odoo
            but at your disposal""",

    'author': "Kywana dev solution",

    'category': 'Discuss',
    'version': '1.0',
    'price': 75,
    'currency': 'EUR',
    'license': 'AGPL-3',
    'installable': True,
    'application': False,
    'images': ['images/image1.jpg', 'images/image2.PNG'],
    'data': [
        'views/modern_mail.xml',
    ],
    'qweb': [
        'static/src/xml/client_action.xml',
        'static/src/xml/composer.xml',
        'static/src/xml/thread.xml',
    ],

    # any module necessary for this one to work correctly
    'depends': ['base', 'mail']

}
