﻿#pragma once
//------------------------------------------------------------------------------
//     This code was generated by a tool.
//
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
//------------------------------------------------------------------------------

#include "XamlTypeInfo.g.h"

namespace C__
{
    partial ref class App :  public ::Windows::UI::Xaml::Application,
        public ::Windows::UI::Xaml::Markup::IXamlMetadataProvider
    {
    public:
        void InitializeComponent();
        [Windows::Foundation::Metadata::DefaultOverload]
        virtual ::Windows::UI::Xaml::Markup::IXamlType^ GetXamlType(::Windows::UI::Xaml::Interop::TypeName type);
        virtual ::Windows::UI::Xaml::Markup::IXamlType^ GetXamlType(::Platform::String^ fullName);
        virtual ::Platform::Array<::Windows::UI::Xaml::Markup::XmlnsDefinition>^ GetXmlnsDefinitions();
    private:
        ::XamlTypeInfo::InfoProvider::XamlTypeInfoProvider^ _provider;
        bool _contentLoaded;
    };
}

