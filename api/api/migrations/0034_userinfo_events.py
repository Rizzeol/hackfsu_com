# -*- coding: utf-8 -*-
# Generated by Django 1.10.4 on 2018-02-05 13:42
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0033_scanevent_scanrecord'),
    ]

    operations = [
        migrations.AddField(
            model_name='userinfo',
            name='events',
            field=models.ManyToManyField(through='api.ScanRecord', to='api.ScanEvent'),
        ),
    ]